import pino from "pino";
import { env } from "./env";

const isDev = env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  base: undefined,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password"],
    remove: true,
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      }
    : undefined,
});

export default logger;
