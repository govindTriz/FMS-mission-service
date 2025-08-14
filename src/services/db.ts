import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "production"
      ? ["error"]
      : ["query", "error", "warn"],
});

// Eagerly connect and log status
(async () => {
  try {
    await prisma.$connect();
    console.log("[DB] Connected to database");
  } catch (err) {
    console.error("[DB] Connection error:", err);
    process.exit(1); // fail fast
  }
})();

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("[DB] Disconnected (SIGINT)");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("[DB] Disconnected (SIGTERM)");
  process.exit(0);
});
