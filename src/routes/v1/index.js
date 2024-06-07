import { Router } from "express";
import counterRoutes from "./counterRoutes.js";
import memberRoutes from "./memberRoutes.js";
import roleRoutes from "./roleRoutes.js";
import slipRoutes from "./slipRoutes.js";
import userRoutes from "./userRoutes.js";
import voterRoutes from "./voterRoutes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/member", memberRoutes);
router.use("/voter", voterRoutes);
router.use("/slip", slipRoutes);
router.use("/role", roleRoutes);
router.use("/counter", counterRoutes);

export default router;
