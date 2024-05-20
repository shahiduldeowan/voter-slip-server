import { logger } from "../config/logConfig.js";
import { ApiJsonError } from "../utils/ApiError.js";

const errorHandler = (err, _, res, next) => {
  logger.error(err.message || "Internal server error!");
  res.status(500).json(new ApiJsonError(500, "Internal server error"));
};

export { errorHandler };
