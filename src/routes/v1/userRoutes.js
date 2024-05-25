import { Router } from "express";
import {
  existUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../../controllers/v1/userControllers.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";

const router = Router();

router.route("/exist/:username").get(existUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyJWT, logoutUser);

export default router;
