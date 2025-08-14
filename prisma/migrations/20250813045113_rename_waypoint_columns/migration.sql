-- This is an empty migration.
ALTER TABLE "Waypoint" RENAME COLUMN "waypointId" TO "pointId"; 
ALTER TABLE "Waypoint" RENAME COLUMN "name" TO "label";