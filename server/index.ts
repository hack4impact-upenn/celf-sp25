import MongoConnection from "./src/config/mongoConnection.ts";
import createExpressApp from "./src/config/createExpressApp.ts";
import "dotenv/config";

const main = async () => {
  // Debug logging - check environment variables
  console.log("🔍 Environment check:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("PORT:", process.env.PORT);
  console.log("ATLAS_URI exists:", !!process.env.ATLAS_URI);
  console.log("ATLAS_URI length:", process.env.ATLAS_URI?.length || 0);
  console.log("COOKIE_SECRET exists:", !!process.env.COOKIE_SECRET);
  console.log("MIXPANEL_TOKEN exists:", !!process.env.MIXPANEL_TOKEN);
  console.log("---");
  
  // Listen for termination
  process.on("SIGTERM", () => process.exit());

  // Set up the datbase connection
  const dbConnection = await MongoConnection.getInstance();
  dbConnection.open();

  // Instantiate express app with configured routes and middleware
  const app = createExpressApp(dbConnection.createSessionStore());

  // Instantiate a server to listen on a specified port
  app.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")} 🚀`);
    console.log("  Press Control-C to stop\n");
  });
};

// Run the server
main();
