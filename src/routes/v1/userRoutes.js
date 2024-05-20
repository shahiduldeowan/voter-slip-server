import { Router } from "express";
import { registerUser } from "../../controllers/v1/userControllers.js";

const router = Router();

router.route("/register").post(registerUser);

export default router;
