-- CreateTable
CREATE TABLE "public"."Mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "deploymentData" JSONB,
    "zoneId" TEXT NOT NULL,
    "zoneData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Waypoint" (
    "id" TEXT NOT NULL,
    "waypointId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER,
    "missionId" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mission_deploymentId_idx" ON "public"."Mission"("deploymentId");

-- CreateIndex
CREATE INDEX "Mission_zoneId_idx" ON "public"."Mission"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_deploymentId_name_key" ON "public"."Mission"("deploymentId", "name");

-- CreateIndex
CREATE INDEX "Waypoint_missionId_idx" ON "public"."Waypoint"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "Waypoint_missionId_waypointId_key" ON "public"."Waypoint"("missionId", "waypointId");

-- AddForeignKey
ALTER TABLE "public"."Waypoint" ADD CONSTRAINT "Waypoint_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
