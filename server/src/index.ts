import app from "./app.js";
import { closeDB, connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
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
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
