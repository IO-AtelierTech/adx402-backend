import app from "./app"
import { pool } from "./db/client";
import env from "./env";
import logger from "./utils/logger";

const { PORT, APP_ENV } = env;
const HOST = "0.0.0.0"; // Essential for Cloud Run

/**
 * Function to explicitly connect to the database pool and verify connectivity.
 * This should be called once at application startup.
 */
async function connectDatabase(): Promise<void> {
  try {
    // Attempt to acquire a client from the pool to test the connection
    const client = await pool.connect();
    client.release(); // Release the client back to the pool immediately
    logger.info("Successfully connected to PostgreSQL database.");
  } catch (err: any) {
    logger.error("Failed to connect to PostgreSQL database:", {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    // In a production environment, if the database is critical,
    // you might want to throw the error or exit the application.
    throw new Error(`Database connection failed: ${err.message}`);
  }
}

async function startServer() {
  try {
    // Connect to database and Redis first
    await connectDatabase();
    //await getRedisClient();

    // Start listening for requests
    return app.listen(PORT, HOST, () => {
      logger.info(`🚀 Swagger Docs: http://${HOST}:${PORT}/docs`);
      logger.info(`Environment: ${APP_ENV}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    // Exit the process if critical services cannot be started
    process.exit(1);
  }
}

(async () => {
  const server = await startServer();

  // Add error listener to the pool itself
  pool.on("error", (err: Error) => {
    logger.error("Unexpected error on idle client in PostgreSQL pool", err);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    server.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });

  server.on("error", (error: any) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;

    switch (error.code) {
      case "EACCES":
        logger.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        logger.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
})();
