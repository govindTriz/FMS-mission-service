import { Router } from "express";
import { custom, z } from "zod";
import { validateBody, validateParams } from "../middleware/validate";
import {
  CreateMissionSchema,
  UpdateMissionSchema,
  IdParamSchema,
  listMissions,
  getMission,
  createMission,
  updateMission,
  deleteMission,
  assignMission,
  assignMissionSchema,
} from "../controller/mission";

const router = Router();

// List missions with optional filters
router.get("/", async (req, res, next) => {
  try {
    const querySchema = z.object({
      customerId: z.string().optional(),
      deploymentId: z.string().optional(),
      zoneId: z.string().optional(),
      name: z.string().optional(),
      skip: z.coerce.number().int().min(0).optional(),
      take: z.coerce.number().int().min(1).max(100).optional(),
    });
    const q = querySchema.parse(req.query);
    const result = await listMissions(q);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get mission by id
router.get("/:id", validateParams(IdParamSchema), async (req, res, next) => {
  try {
    const mission = await getMission(req.params.id, req.params.customerId);
    res.json(mission);
  } catch (err) {
    next(err);
  }
});

// Create mission
router.post("/", validateBody(CreateMissionSchema), async (req, res, next) => {
  try {
    const mission = await createMission(req.body);
    res.status(201).json(mission);
  } catch (err) {
    next(err);
  }
});

// Update mission
router.put(
  "/:id",
  validateParams(IdParamSchema),
  validateBody(UpdateMissionSchema),
  async (req, res, next) => {
    try {
      const mission = await updateMission(req.params.id, req.body);
      res.json(mission);
    } catch (err) {
      next(err);
    }
  }
);

// Delete mission
router.delete("/:id", validateParams(IdParamSchema), async (req, res, next) => {
  try {
    await deleteMission(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post(
  "/assign-mission",
  validateBody(assignMissionSchema),
  async (req, res, next) => {
    try {
      const assigned = await assignMission(req.body);
      res.status(201).json(assigned);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
