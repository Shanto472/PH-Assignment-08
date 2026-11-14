process.on("uncaughtException", (error) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("FATAL UNHANDLED REJECTION:", reason);
  process.exit(1);
});

import app from "./app.js";
import { closeDB, connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    const maskedUri = env.mongodbUri.replace(/:([^@:]+)@/, ":****@");
    console.log(`Connecting to MongoDB (${maskedUri})...`);
    await connectDB();
    console.log("Connected to MongoDB successfully.");

    const server = app.listen(env.port, () => {
      console.log(`CivicRoots API server listening on port ${env.port}`);
    });

    const shutdown = async () => {
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start CivicRoots API server:", error);
    if (error instanceof Error) {
      console.error("Details:", error.name, "-", error.message);
    }
    process.exit(1);
  }
}

startServer();
