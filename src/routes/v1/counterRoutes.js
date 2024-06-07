import { Router } from "express";
import {
  createCounters,
  getCounters,
} from "../../controllers/v1/counterController.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";

const router = Router();

router.route("/").get(verifyJWT, getCounters).post(verifyJWT, createCounters);

export default router;
