import { logger } from "../../config/logConfig.js";
import { onAllRoles } from "../../models/v1/RoleModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getRoles = async (req, res) => {
  try {
    const roles = await onAllRoles();
    return res.status(200).json(new ApiResponse(200, roles, "SUCCESS"));
  } catch (error) {
    logger.error(error.message || "Error while getting roles");
    console.log(error.stack);

    return res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Error while getting roles"
        )
      );
  }
};

export { getRoles };
