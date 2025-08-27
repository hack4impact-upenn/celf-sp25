import MongoConnection from "./src/config/mongoConnection";
import createExpressApp from "./src/config/createExpressApp";
import "dotenv/config";

const main = async () => {
  console.log("Starting server...");
  
  // Debug logging - check environment variables
  console.log("Environment check:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("PORT:", process.env.PORT);
  console.log("ATLAS_URI exists:", !!process.env.ATLAS_URI);
  console.log("ATLAS_URI length:", process.env.ATLAS_URI?.length || 0);
  console.log("COOKIE_SECRET exists:", !!process.env.COOKIE_SECRET);
  console.log("MIXPANEL_TOKEN exists:", !!process.env.MIXPANEL_TOKEN);
  console.log("---");
  
  // Listen for termination
  console.log("Setting up process termination handlers...");
  process.on("SIGTERM", () => process.exit());

  // Set up the datbase connection
  console.log("Initializing database connection...");
  const dbConnection = await MongoConnection.getInstance();
  console.log("Database connection instance created");
  
  console.log("Opening database connection...");
  dbConnection.open();
  console.log("Database connection opened");

  // Instantiate express app with configured routes and middleware
  console.log("Creating Express app...");
  const app = createExpressApp(dbConnection.createSessionStore());
  console.log("Express app created");

  // Instantiate a server to listen on a specified port
  console.log("Attempting to listen on port...");
  app.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")} 🚀`);
    console.log("  Press Control-C to stop\n");
  });
  
  console.log("Server startup completed successfully!");
};

// Run the server
console.log("Calling main() function...");
main();
