import express from "express";
import path from "path";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import routers from "../routes/routers";
import initializePassport from "./configPassport";
import "dotenv/config";
import apiErrorResponder from "../util/apiErrorResponder";
import ApiError from "../util/apiError";

/**
 * Creates an express instance with the appropriate routes and middleware
 * for the project.
 * @param sessionStore The {@link MongoStore} to use to store user sessions
 * @returns The configured {@link express.Express} instance
 */
const createExpressApp = (sessionStore: MongoStore): express.Express => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  const app = express();

  // Set up passport and strategies
  initializePassport(passport);

  // Sets the port for the app
  app.set("port", process.env.PORT || 4000);
  // Gives express the ability to parse requests with JSON and turn the JSON into objects
  app.use(express.json({limit: '16mb'}));
  // Gives express the ability to parse urlencoded payloads
  app.use(
    express.urlencoded({
      extended: true,
      limit: '16mb',
    })
  );
  // Gives express the ability accept origins outside its own to accept requests from
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          FRONTEND_URL,
          "http://localhost:3000",
          "hackboilerplate.com",
          "https://hackboilerplate.com",
          "http://hackboilerplate.com",
        ];
        
        // Allow any Heroku app domain
        if (origin.includes('.herokuapp.com')) {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
  // Gives express the ability to parse client cookies and add them to req.cookies
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // Use express-session to maintain sessions
  app.use(
    session({
      secret: process.env.COOKIE_SECRET || "SHOULD_DEFINE_COOKIE_SECRET",
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      store: sessionStore, // use MongoDB to store session info
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false, // Set to true in production with HTTPS
        httpOnly: false, // Allow client-side access for debugging
        sameSite: 'lax', // Allow cross-origin requests
      },
    }) as any
  );

  // Init passport on every route call and allow it to use "express-session"
  app.use(passport.initialize() as any);
  app.use(passport.session() as any);

  // Inits routers listed in routers.ts file
  routers.forEach((entry) => app.use(entry.prefix, entry.router));

  // Serving static files
  if (process.env.NODE_ENV === "production") {
    const root = path.join(__dirname, "../../../../", "client", "build");

    app.use(express.static(root));
    app.get("*", (_: any, res: any) => {
      res.sendFile("index.html", { root });
    });
  }

  // Handles all non matched routes
  app.use((req, res, next) => {
    next(ApiError.notFound("Endpoint unavailable"));
  });

  // Sets the error handler to use for all errors passed on by previous handlers
  app.use(apiErrorResponder);

  return app;
};

export default createExpressApp;
