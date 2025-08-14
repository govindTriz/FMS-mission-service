import { prisma } from "../services/db";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export const WaypointInput = z.object({
  pointId: z.string().min(1),
  label: z.string().min(1),
  order: z.number().int().optional(),
  // Accepts array of tasks or any JSON payload
  tasks: z.any(),
});

export const CreateMissionSchema = z.object({
  name: z.string().min(1),
  deploymentId: z.string().min(1),
  deploymentData: z.any().optional(),
  zoneId: z.string().min(1),
  zoneData: z.any().optional(),
  waypoints: z.array(WaypointInput).default([]),
});

export const UpdateMissionSchema = z.object({
  name: z.string().min(1).optional(),
  deploymentData: z.any().optional(),
  zoneData: z.any().optional(),
  // If provided, will replace all existing waypoints
  waypoints: z.array(WaypointInput).optional(),
});

export const IdParamSchema = z.object({ id: z.string().cuid() });

export async function listMissions(query: {
  deploymentId?: string;
  zoneId?: string;
  name?: string;
  skip?: number;
  take?: number;
}) {
  const { deploymentId, zoneId, name, skip = 0, take = 50 } = query;
  const where: any = {};
  if (deploymentId) where.deploymentId = deploymentId;
  if (zoneId) where.zoneId = zoneId;
  if (name) where.name = { contains: name, mode: "insensitive" };

  const [items, total] = await prisma.$transaction([
    prisma.mission.findMany({
      where,
      include: {
        waypoints: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.mission.count({ where }),
  ]);

  return { items, total, skip, take };
}

export async function getMission(id: string) {
  const mission = await prisma.mission.findUnique({
    where: { id },
    include: {
      waypoints: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!mission) throw new AppError("Mission not found", 404);
  return mission;
}

export async function createMission(
  input: z.infer<typeof CreateMissionSchema>
) {
  try {
    // nested create waypoints
    const mission = await prisma.mission.create({
      data: {
        name: input.name,
        deploymentId: input.deploymentId,
        deploymentData: input.deploymentData,
        zoneId: input.zoneId,
        zoneData: input.zoneData,
        waypoints: {
          create: input.waypoints.map((w) => ({
            pointId: w.pointId,
            label: w.label,
            order: w.order,
            tasks: w.tasks,
          })),
        },
      },
      include: {
        waypoints: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      },
    });
    return mission;
  } catch (err: any) {
    // Unique constraint: mission name per deployment or waypoint duplicate
    if (err.code === "P2002") {
      throw new AppError("Duplicate entry", 409, { target: err.meta?.target });
    }
    throw err;
  }
}

export async function updateMission(
  id: string,
  input: z.infer<typeof UpdateMissionSchema>
) {
  // Ensure mission exists first
  const existing = await prisma.mission.findUnique({ where: { id } });
  if (!existing) throw new AppError("Mission not found", 404);

  try {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.deploymentData !== undefined)
      data.deploymentData = input.deploymentData;
    if (input.zoneData !== undefined) data.zoneData = input.zoneData;

    let include: any = undefined;
    let waypointsOps: any = undefined;

    if (input.waypoints) {
      waypointsOps = {
        deleteMany: {},
        create: input.waypoints.map((w) => ({
          pointId: w.pointId,
          label: w.label,
          order: w.order,
          tasks: w.tasks,
        })),
      };
      include = {
        waypoints: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      };
    }

    const updated = await prisma.mission.update({
      where: { id },
      data: { ...data, ...(waypointsOps ? { waypoints: waypointsOps } : {}) },
      include,
    });
    return updated;
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new AppError("Duplicate entry", 409, { target: err.meta?.target });
    }
    throw err;
  }
}

export async function deleteMission(id: string) {
  try {
    await prisma.mission.delete({ where: { id } });
  } catch (err: any) {
    if (err.code === "P2025") throw new AppError("Mission not found", 404);
    throw err;
  }
}
