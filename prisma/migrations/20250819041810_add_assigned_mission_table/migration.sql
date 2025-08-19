/*
  Warnings:

  - You are about to drop the column `missionIds` on the `Scheduler` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Scheduler" DROP COLUMN "missionIds";

-- CreateTable
CREATE TABLE "public"."AssignedMission" (
    "id" TEXT NOT NULL,
    "schedulerId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedMission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignedMission_schedulerId_idx" ON "public"."AssignedMission"("schedulerId");

-- CreateIndex
CREATE INDEX "AssignedMission_missionId_idx" ON "public"."AssignedMission"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedMission_schedulerId_missionId_key" ON "public"."AssignedMission"("schedulerId", "missionId");

-- AddForeignKey
ALTER TABLE "public"."AssignedMission" ADD CONSTRAINT "AssignedMission_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "public"."Scheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssignedMission" ADD CONSTRAINT "AssignedMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
