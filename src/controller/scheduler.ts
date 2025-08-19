import { prisma } from "../services/db";
import { json, z } from "zod";
import { AppError } from "../middleware/errorHandler";

export const SchedulerCreateSchema = z.object({
  schedulerName: z.string().min(1),
  schedulerId: z.string().min(1),
  deploymentId: z.string().min(1),
  zoneId: z.string().min(1),
  missionIds: z.array(z.string().cuid()).default([]),
  schedulerOption: json(),
});

export const SchedulerUpdateSchema = z.object({
  schedulerName: z.string().min(1).optional(),
  deploymentId: z.string().min(1),
  zoneId: z.string().min(1).optional(),
  missionIds: z.array(z.string().cuid()).optional(),
  schedulerOption: json(),
});

export const SchedulerIdParamSchema = z.object({ id: z.string().cuid() });

function uniqueMissionIds(ids: string[]) {
  return Array.from(new Set(ids));
}

export async function listSchedulers(query: {
  deploymentId?: string;
  zoneId?: string;
  schedulerName?: string;
  skip?: number;
  take?: number;
}) {
  const { deploymentId, zoneId, schedulerName, skip = 0, take = 50 } = query;
  const where: any = {};
  if (deploymentId) where.deploymentId = deploymentId;
  if (zoneId) where.zoneId = zoneId;
  if (schedulerName)
    where.schedulerName = { contains: schedulerName, mode: "insensitive" };

  const [items, total] = await prisma.$transaction([
    prisma.scheduler.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.scheduler.count({ where }),
  ]);

  return { items, total, skip, take };
}

export async function getScheduler(id: string) {
  const scheduler = await prisma.scheduler.findUnique({
    where: { id },
  });
  if (!scheduler) throw new AppError("Scheduler not found", 404);
  return scheduler;
}

export async function createScheduler(
  input: z.infer<typeof SchedulerCreateSchema>
) {
  try {
    const scheduler = await prisma.scheduler.create({
      data: {
        schedulerName: input.schedulerName,
        schedulerId: input.schedulerId,
        deploymentId: input.deploymentId,
        zoneId: input.zoneId,
        missionIds: input.missionIds, // store array directly
        schedulerOption: input.schedulerOption || {},
      },
    });
    return scheduler;
  } catch (err: any) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const key = Array.isArray(target) ? target.join(", ") : target;
      throw new AppError(
        `Duplicate entry for unique field(s): ${key.toUpperCase()}`,
        409,
        {
          target,
        }
      );
    }
    if (err.code === "P2003") {
      throw new AppError("Invalid missionId in assignments", 400);
    }
    throw err;
  }
}

export async function updateScheduler(
  id: string,
  input: z.infer<typeof SchedulerUpdateSchema>
) {
  const existing = await prisma.scheduler.findUnique({ where: { id } });
  if (!existing) throw new AppError("Scheduler not found", 404);

  try {
    const data: any = {};
    if (input.schedulerName !== undefined)
      data.schedulerName = input.schedulerName;
    if (input.zoneId !== undefined) data.zoneId = input.zoneId;
    if (input.missionIds !== undefined) data.missionIds = input.missionIds; // replace whole array

    const updated = await prisma.scheduler.update({
      where: { id },
      data,
    });
    return updated;
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new AppError("Duplicate scheduler for deployment", 409, {
        target: err.meta?.target,
      });
    }
    if (err.code === "P2003") {
      throw new AppError("Invalid missionId in assignments", 400);
    }
    throw err;
  }
}

export async function deleteScheduler(id: string) {
  try {
    await prisma.scheduler.delete({ where: { id } });
  } catch (err: any) {
    if (err.code === "P2025") throw new AppError("Scheduler not found", 404);
    throw err;
  }
}
