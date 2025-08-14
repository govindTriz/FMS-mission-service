import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/db";
import { validateBody, validateParams } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const UpdateUser = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
});

const IdParam = z.object({ id: z.string().cuid() });

router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validateParams(IdParam), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(CreateUser), async (req, res, next) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id",
  validateParams(IdParam),
  validateBody(UpdateUser),
  async (req, res, next) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(user);
    } catch (err: any) {
      if (err.code === "P2025")
        return next(new AppError("User not found", 404));
      next(err);
    }
  }
);

router.delete("/:id", validateParams(IdParam), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") return next(new AppError("User not found", 404));
    next(err);
  }
});

export default router;
