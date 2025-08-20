/*
  Warnings:

  - Added the required column `customerId` to the `AssignedSchedulerAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Scheduler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Waypoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AssignedSchedulerAsset" ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Mission" ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Scheduler" ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Waypoint" ADD COLUMN     "customerId" TEXT NOT NULL;
