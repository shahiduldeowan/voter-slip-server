import { Router } from "express";
import userRoutes from "./userRoutes.js";
import memberRoutes from "./memberRoutes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/member", memberRoutes);

export default router;
