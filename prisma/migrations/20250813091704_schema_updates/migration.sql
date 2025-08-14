/*
  Warnings:

  - You are about to drop the `SchedulerMission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SchedulerMission" DROP CONSTRAINT "SchedulerMission_missionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SchedulerMission" DROP CONSTRAINT "SchedulerMission_schedulerId_fkey";

-- AlterTable
ALTER TABLE "public"."Scheduler" ADD COLUMN     "assignments" TEXT[];

-- DropTable
DROP TABLE "public"."SchedulerMission";
