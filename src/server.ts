import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./lib/env";
import logger from "./lib/logger";
import crypto from "crypto";
import { prisma } from "./services/db";
import http from "http";

export async function createServer() {
  const app = express();

  // Harden express
  app.disable("x-powered-by");

  // Trust proxy if behind reverse proxy (nginx, ingress)
  if (env.TRUST_PROXY) {
    app.set("trust proxy", true);
  }

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable if serving only API; adjust if serving HTML
    })
  );

  // CORS
  const corsOptions = {
    origin: env.CORS_ORIGIN, // allowed origin; no "*"
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  };
  app.use(cors(corsOptions));
  // Explicitly handle preflight

  // Compression
  app.use(compression());

  // JSON parser with limit
  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true }));

  // Logging with request id
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) =>
        req.headers["x-request-id"]?.toString() || crypto.randomUUID(),
      customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    })
  );

  // Expose request id in responses
  app.use((req, res, next) => {
    const id = (req as any).id as string | undefined;
    if (id) res.setHeader("x-request-id", id);
    next();
  });

  // Rate limiting (basic global)
  if (env.RATE_LIMIT_WINDOW_MS && env.RATE_LIMIT_MAX) {
    app.use(
      rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  // Healthcheck (with optional DB ping)
  app.get("/healthz", async (req, res) => {
    const checkDb = req.query.db === "1";
    if (!checkDb) return res.status(200).json({ status: "ok" });
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.status(200).json({ status: "ok", db: "up" });
    } catch {
      return res.status(503).json({ status: "degraded", db: "down" });
    }
  });

  // API routes
  app.use("/api", routes);

  // 404 and error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = http.createServer(app);

  // Timeouts
  server.requestTimeout = env.REQUEST_TIMEOUT_MS ?? 30000; // sets the timeout value for sockets
  server.keepAliveTimeout = env.KEEP_ALIVE_TIMEOUT_MS ?? 5000;
  server.headersTimeout = env.HEADERS_TIMEOUT_MS ?? 60000;

  // Optional fail-fast DB check
  if (env.FAIL_FAST_DB) {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      logger.error({ e }, "Database is not reachable");
      throw e;
    }
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.warn({ signal }, "Shutting down...");
    try {
      await prisma.$disconnect();
    } catch (e) {
      logger.error({ e }, "Error during Prisma disconnect");
    }
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
    // Force exit if not closed in time
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // replace app.listen with server.listen
  // Healthcheck and routes already registered above

  // Return app but attach a custom listen using the created server
  // to keep index.ts simple and to control timeouts.
  // @ts-expect-error decorate
  app.listen = (port: number, cb?: () => void) => server.listen(port, cb);

  return app;
}
