import { Router } from "express";
import users from "./users";
import mission from "./mission";
import scheduler from "./scheduler";

const router = Router();

router.use("/users", users);
router.use("/mission", mission);
router.use("/scheduler", scheduler);

export default router;
