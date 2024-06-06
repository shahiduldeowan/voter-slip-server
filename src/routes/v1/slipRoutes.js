import { Router } from "express";
import {
  getSlip,
  getSlipQueueList,
  slipReset,
} from "../../controllers/v1/slipController.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";

const router = Router();

router.route("/issue/:AccountNumber").get(verifyJWT, getSlip);
router.route("/queue").get(verifyJWT, getSlipQueueList);
router.route("/reset/:VoterID").get(verifyJWT, slipReset);

export default router;
