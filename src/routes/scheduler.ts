import { Router } from "express";
import { z } from "zod";
import { validateBody, validateParams } from "../middleware/validate";
import {
  SchedulerCreateSchema,
  SchedulerUpdateSchema,
  SchedulerIdParamSchema,
  listSchedulers,
  getScheduler,
  createScheduler,
  updateScheduler,
  deleteScheduler,
  assignScheduler,
  AssignSchedulerSchema,
  getAssignedSchedulerAsset,
} from "../controller/scheduler";

const router = Router();

// List schedulers with filters
router.get("/", async (req, res, next) => {
  try {
    const querySchema = z.object({
      customerId: z.string().optional(),
      deploymentId: z.string().optional(),
      zoneId: z.string().optional(),
      schedulerName: z.string().optional(),
      skip: z.coerce.number().int().min(0).optional(),
      take: z.coerce.number().int().min(1).max(100).optional(),
    });
    const q = querySchema.parse(req.query);
    const result = await listSchedulers(q);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get by id
router.get(
  "/:id",
  validateParams(SchedulerIdParamSchema),
  async (req, res, next) => {
    try {
      const item = await getScheduler(req.params.id, req.params.customerId);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Create
router.post(
  "/",
  validateBody(SchedulerCreateSchema),
  async (req, res, next) => {
    try {
      const item = await createScheduler(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Update (replace assignments if missionIds provided)
router.put(
  "/:id",
  validateParams(SchedulerIdParamSchema),
  validateBody(SchedulerUpdateSchema),
  async (req, res, next) => {
    try {
      const item = await updateScheduler(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Delete
router.delete(
  "/:id",
  validateParams(SchedulerIdParamSchema),
  async (req, res, next) => {
    try {
      await deleteScheduler(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/assign-scheduler",
  validateBody(AssignSchedulerSchema),
  async (req, res, next) => {
    try {
      const result = await assignScheduler(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/assigned-asset/:schedulerId", async (req, res, next) => {
  try {
    const asset = await getAssignedSchedulerAsset(
      req.params.schedulerId,
      req.query.customerId as string | undefined
    );
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

export default router;
