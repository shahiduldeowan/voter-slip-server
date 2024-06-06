import { Router } from "express";
import { getRoles } from "../../controllers/v1/roleControllers.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";

const router = Router();

router.route("/").get(verifyJWT, getRoles);

export default router;
