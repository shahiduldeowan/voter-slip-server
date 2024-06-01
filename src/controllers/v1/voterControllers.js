import { logger } from "../../config/logConfig.js";
import { findSingleVoterByQuery } from "../../models/v1/voterModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * This function is responsible for finding a single voter based on a query parameter.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const findSingleVoter = async (req, res) => {
  try {
    const query = req.params?.query;
    const voter = await findSingleVoterByQuery(query);
    if (!voter) {
      return res.status(404).json(new ApiJsonError(404, "Voter not found"));
    }

    return res.status(200).json(new ApiResponse(200, voter, "voter found"));
  } catch (error) {
    logger.error(error.message);
    console.log(error.stack);
    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

export { findSingleVoter };
