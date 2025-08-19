/*
  Warnings:

  - A unique constraint covering the columns `[missionId]` on the table `Mission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schedulerId]` on the table `Scheduler` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `missionId` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedulerId` to the `Scheduler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedulerOption` to the `Scheduler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Mission" ADD COLUMN "missionId" TEXT;
UPDATE "Mission" SET "missionId" = gen_random_uuid()::text WHERE "missionId" IS NULL;
ALTER TABLE "Mission" ALTER COLUMN "missionId" SET NOT NULL;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_missionId_key" UNIQUE ("missionId");

-- AlterTable
ALTER TABLE "public"."Scheduler" ADD COLUMN "schedulerId" TEXT;
UPDATE "Scheduler" SET "schedulerId" = gen_random_uuid()::text WHERE "schedulerId" IS NULL;
ALTER TABLE "Scheduler" ALTER COLUMN "schedulerId" SET NOT NULL;
ALTER TABLE "Scheduler" ADD CONSTRAINT "Scheduler_schedulerId_key" UNIQUE ("schedulerId");

-- For Scheduler.schedulerOption (set to empty JSON by default)
ALTER TABLE "Scheduler" ADD COLUMN "schedulerOption" JSONB;
UPDATE "Scheduler" SET "schedulerOption" = '{}' WHERE "schedulerOption" IS NULL;
ALTER TABLE "Scheduler" ALTER COLUMN "schedulerOption" SET NOT NULL;
