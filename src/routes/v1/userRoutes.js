import { Router } from "express";
import {
  authUserStatus,
  existUser,
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
} from "../../controllers/v1/userControllers.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllUsers);
router.route("/exist/:username").get(verifyJWT, existUser);
router.route("/register").post(verifyJWT, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/auth-status").get(verifyJWT, authUserStatus);

export default router;
