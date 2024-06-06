import { Router } from "express";
import {
  findSingleVoter,
  getVoterCounts,
} from "../../controllers/v1/voterControllers.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";

const router = Router();

router.route("/find/:query").get(verifyJWT, findSingleVoter);
router.route("/count").get(verifyJWT, getVoterCounts);
export default router;
