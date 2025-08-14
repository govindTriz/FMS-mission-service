import { createServer } from "./server";
import { env } from "./lib/env";
import logger from "./lib/logger";

const port = Number(env.PORT ?? 8004);

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection");
  process.exit(1);
});

async function main() {
  try {
    const app = await createServer();
    const server = app.listen(port, () => {
      logger.info({ port }, `Server listening on port ${port}`);
    });

    const shutdown = (signal: string) => {
      logger.warn({ signal }, "Received signal");
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

main();
