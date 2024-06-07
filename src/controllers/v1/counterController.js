import { logger } from "../../config/logConfig.js";
import {
  onInsertCounter,
  onSelectCounters,
} from "../../models/v1/counterModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getCounters = async (req, res) => {
  try {
    const counters = await onSelectCounters();
    return res
      .status(200)
      .json(new ApiResponse(200, counters, "counters fetched successfully"));
  } catch (error) {
    logger.error(error.message || "Internal server error");
    console.log(error.stack);

    return res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const createCounters = async (req, res) => {
  try {
    const { UserID } = req.user;
    const counter = req.body;
    const dbResponse = await onInsertCounter(UserID, counter);

    return res
      .status(200)
      .json(new ApiResponse(200, dbResponse, "Counters created successfully"));
  } catch (error) {
    logger.error(error.message || "Internal server error");
    console.log(error.stack);

    return res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error"
        )
      );
  }
};

export { createCounters, getCounters };
