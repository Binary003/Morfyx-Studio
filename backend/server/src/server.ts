import app from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

const start = async () => {
  try {
    await connectDb();
    const server = app.listen(env.port, () => {
      console.log(`[${new Date().toISOString()}] ✓ Server running on port ${env.port}`);
      console.log(`[${new Date().toISOString()}] ✓ Environment: ${env.nodeEnv}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
};

start();
