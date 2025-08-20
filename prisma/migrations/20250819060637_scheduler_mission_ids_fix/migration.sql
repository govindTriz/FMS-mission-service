/*
  Warnings:

  - You are about to drop the column `missionId` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `schedulerId` on the `Scheduler` table. All the data in the column will be lost.
  - You are about to drop the column `schedulerOption` on the `Scheduler` table. All the data in the column will be lost.
  - You are about to drop the `AssignedMission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AssignedMission" DROP CONSTRAINT "AssignedMission_missionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssignedMission" DROP CONSTRAINT "AssignedMission_schedulerId_fkey";

-- DropIndex
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_missionId_key";

-- DropIndex
ALTER TABLE "public"."Scheduler" DROP CONSTRAINT "Scheduler_schedulerId_key";

-- AlterTable
ALTER TABLE "public"."Mission" DROP COLUMN "missionId";

-- AlterTable
ALTER TABLE "public"."Scheduler" DROP COLUMN "schedulerId",
DROP COLUMN "schedulerOption";

-- DropTable
DROP TABLE "public"."AssignedMission";
