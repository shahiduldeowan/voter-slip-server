import { Router } from "express";
import {
  existUser,
  registerUser,
  loginUser,
} from "../../controllers/v1/userControllers.js";

const router = Router();

router.route("/exist/:username").get(existUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

export default router;
