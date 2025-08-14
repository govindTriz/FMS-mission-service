import "dotenv/config";

function getNumber(name: string, fallback?: number) {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: getNumber("PORT", 3000),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  BODY_LIMIT: process.env.BODY_LIMIT || "1mb",
  TRUST_PROXY: (process.env.TRUST_PROXY || "false").toLowerCase() === "true",
  RATE_LIMIT_WINDOW_MS: getNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  RATE_LIMIT_MAX: getNumber("RATE_LIMIT_MAX", 100),
  REQUEST_TIMEOUT_MS: getNumber("REQUEST_TIMEOUT_MS", 30000),
  KEEP_ALIVE_TIMEOUT_MS: getNumber("KEEP_ALIVE_TIMEOUT_MS", 5000),
  HEADERS_TIMEOUT_MS: getNumber("HEADERS_TIMEOUT_MS", 60000),
  FAIL_FAST_DB: (process.env.FAIL_FAST_DB || "false").toLowerCase() === "true",
} as const;

export type Env = typeof env;
