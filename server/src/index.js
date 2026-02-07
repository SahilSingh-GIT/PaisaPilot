import { createApp } from "./app.js";
import { ENV, validateEnv } from "./config/env.js";
import { prisma } from "./config/db.js";

// Validate environment variables on startup
validateEnv();

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`
  ======================================================
  🚀 PaisaPilot Server Running
  📡 Port:        ${ENV.PORT}
  🌍 Environment: ${ENV.NODE_ENV}
  🩺 Health URL:  http://localhost:${ENV.PORT}/api/health
  ======================================================
  `);
});

// Graceful shutdown handlers
async function gracefulShutdown(signal) {
  console.log(
    `\n[SHUTDOWN] Received ${signal}. Closing HTTP server and database connections...`,
  );
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log(
        "[SHUTDOWN] Prisma disconnected successfully. Process terminated cleanly.",
      );
      process.exit(0); //process is a Node.js global object 
      // that represents your currently running Node.js application.
    } catch (err) {
      console.error("[SHUTDOWN] Error during disconnect:", err);
      process.exit(1);
    }
  });

  // Force shutdown after timeout if pending connections hang
  setTimeout(() => {
    console.error("[SHUTDOWN] Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
