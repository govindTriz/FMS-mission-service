-- CreateTable
CREATE TABLE "public"."Scheduler" (
    "id" TEXT NOT NULL,
    "schedulerName" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheduler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchedulerMission" (
    "schedulerId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchedulerMission_pkey" PRIMARY KEY ("schedulerId","missionId")
);

-- CreateIndex
CREATE INDEX "Scheduler_deploymentId_idx" ON "public"."Scheduler"("deploymentId");

-- CreateIndex
CREATE INDEX "Scheduler_zoneId_idx" ON "public"."Scheduler"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Scheduler_deploymentId_schedulerName_key" ON "public"."Scheduler"("deploymentId", "schedulerName");

-- CreateIndex
CREATE INDEX "SchedulerMission_missionId_idx" ON "public"."SchedulerMission"("missionId");

-- AddForeignKey
ALTER TABLE "public"."SchedulerMission" ADD CONSTRAINT "SchedulerMission_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "public"."Scheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchedulerMission" ADD CONSTRAINT "SchedulerMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."Waypoint_missionId_waypointId_key" RENAME TO "Waypoint_missionId_pointId_key";
