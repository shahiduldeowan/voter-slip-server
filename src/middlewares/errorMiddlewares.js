import { logger } from "../config/logConfig.js";
import { ApiError, ApiJsonError } from "../utils/ApiError.js";

const errorHandler = (err, _, res, next) => {
  logger.error(err.message || "Internal server error!");
  res.status(500).json(new ApiJsonError(500, "Internal server error"));
};

const errorsHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? 400 : 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  logger.error(`${error.message}`);

  return res.status(error.statusCode).json(response);
};

export { errorHandler, errorsHandler };
