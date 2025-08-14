/*
  Warnings:

  - You are about to drop the column `assignments` on the `Scheduler` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Scheduler" DROP COLUMN "assignments",
ADD COLUMN     "missionIds" TEXT[];
