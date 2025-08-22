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
  customerId: z.string().min(1),
});

export const SchedulerUpdateSchema = z.object({
  schedulerName: z.string().min(1).optional(),
  schedulerId: z.string().min(1).optional(),
  deploymentId: z.string().min(1).optional(),
  zoneId: z.string().min(1).optional(),
  missionIds: z.array(z.string().cuid()).optional(),
  schedulerOption: json().optional(),
});

export const AssetInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const AssignSchedulerSchema = z.object({
  deploymentId: z.string().min(1),
  zoneId: z.string().min(1),
  schedulerId: z.string().min(1),
  assets: z.array(AssetInput),
  customerId: z.string().min(1),
});

export const SchedulerIdParamSchema = z.object({ id: z.string().cuid() });

function uniqueMissionIds(ids: string[]) {
  return Array.from(new Set(ids));
}

export async function listSchedulers(query: {
  customerId?: string;
  deploymentId?: string;
  zoneId?: string;
  schedulerName?: string;
  skip?: number;
  take?: number;
}) {
  const { deploymentId, zoneId, schedulerName, skip = 0, take = 50 } = query;
  const where: any = {};
  if (!query.customerId) {
    throw new AppError("Customer ID is required", 400);
  }
  if (query.customerId) where.customerId = query.customerId;
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
      include: {
        AssignedAsset: true,
      },
    }),
    prisma.scheduler.count({ where }),
  ]);

  if (total === 0) {
    throw new AppError("No schedulers found for the given criteria", 404);
  }

  return { items, total, skip, take };
}

export async function getScheduler(id: string, customerId?: string) {
  const scheduler = await prisma.scheduler.findUnique({
    where: { id, customerId },
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
        customerId: input.customerId,
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
    if (input.schedulerId !== undefined) data.schedulerId = input.schedulerId;
    if (input.deploymentId !== undefined)
      data.deploymentId = input.deploymentId;
    if (input.zoneId !== undefined) data.zoneId = input.zoneId;
    if (input.missionIds !== undefined) data.missionIds = input.missionIds;
    if (input.schedulerOption !== undefined)
      data.schedulerOption = input.schedulerOption;

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

export async function assignScheduler(
  input: z.infer<typeof AssignSchedulerSchema>
) {
  // Ensure scheduler exists
  const scheduler = await prisma.scheduler.findUnique({
    where: { id: input.schedulerId },
  });
  if (!scheduler) throw new AppError("Scheduler not found", 404);

  // Upsert AssignedAsset for this scheduler
  await prisma.assignedSchedulerAsset.upsert({
    where: { schedulerId: input.schedulerId },
    update: {
      assets: input.assets, // Save assets as JSON
      deploymentId: input.deploymentId,
      zoneId: input.zoneId,
    },
    create: {
      schedulerId: input.schedulerId,
      assets: input.assets,
      deploymentId: input.deploymentId,
      zoneId: input.zoneId,
      customerId: input.customerId,
    },
  });

  return { success: true };
}

export async function getAssignedSchedulerAsset(
  schedulerId: string,
  customerId?: string
) {
  if (!customerId) {
    throw new AppError("Customer ID is required", 400);
  }
  const asset = await prisma.assignedSchedulerAsset.findUnique({
    where: { schedulerId, customerId },
  });
  if (!asset) throw new AppError("AssignedSchedulerAsset not found", 404);
  return asset;
}
