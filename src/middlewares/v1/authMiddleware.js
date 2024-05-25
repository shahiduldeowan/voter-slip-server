import jwt from "jsonwebtoken";
import { logger } from "../../config/logConfig.js";
import { onGetUser } from "../../models/v1/userModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req?.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      logger.error(`Unauthorized request [${req.url}]`);
      return res.status(401).json(new ApiJsonError(401, "Unauthorized user"));
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeToken?.UserID && !decodeToken?.SessionID) {
      logger.error(`Token expired [${req.url}]`);
      return res.status(401).json(new ApiJsonError(401, "Unauthorized user"));
    }

    const reqUser = await onGetUser(decodeToken?.UserID);
    if (!reqUser[0]?.UserID && !reqUser[0].SessionID) {
      return res.status(401).json(new ApiJsonError(401, "Unauthorized user"));
    }

    if (reqUser[0]?.SessionID !== decodeToken?.SessionID) {
      return res.status(401).json(new ApiJsonError(401, "Unauthorized user"));
    }

    req.user = reqUser[0];
    next();
  } catch (error) {
    return res.status(401).status(new ApiJsonError(401, "Unauthorized access"));
  }
};

export { verifyJWT };
