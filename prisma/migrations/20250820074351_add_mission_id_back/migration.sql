/*
  Warnings:

  - A unique constraint covering the columns `[missionId]` on the table `Mission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schedulerId]` on the table `Scheduler` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `missionId` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedulerId` to the `Scheduler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedulerOption` to the `Scheduler` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Scheduler_deploymentId_idx";

-- DropIndex
DROP INDEX "public"."Scheduler_zoneId_idx";

-- AlterTable
ALTER TABLE "public"."Mission" ADD COLUMN     "missionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Scheduler" ADD COLUMN     "schedulerId" TEXT NOT NULL,
ADD COLUMN     "schedulerOption" JSONB NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."AssignedSchedulerAsset" (
    "id" TEXT NOT NULL,
    "schedulerId" TEXT NOT NULL,
    "assets" JSONB NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedSchedulerAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignedSchedulerAsset_schedulerId_key" ON "public"."AssignedSchedulerAsset"("schedulerId");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_missionId_key" ON "public"."Mission"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "Scheduler_schedulerId_key" ON "public"."Scheduler"("schedulerId");

-- AddForeignKey
ALTER TABLE "public"."AssignedSchedulerAsset" ADD CONSTRAINT "AssignedSchedulerAsset_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "public"."Scheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
