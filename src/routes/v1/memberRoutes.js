import { Router } from "express";
import {
  getMembers,
  uploadMembers,
  uploadMembersImagesZipFile,
} from "../../controllers/v1/memberControllers.js";
import { verifyJWT } from "../../middlewares/v1/authMiddleware.js";
import { uploadFile } from "../../middlewares/v1/multerMiddleware.js";

const router = Router();

router.route("/").get(verifyJWT, getMembers);
router
  .route("/upload")
  .post(verifyJWT, uploadFile.single("members"), uploadMembers);
router
  .route("/upload-images-zip")
  .post(
    verifyJWT,
    uploadFile.single("members-images-zip-file"),
    uploadMembersImagesZipFile
  );

export default router;
