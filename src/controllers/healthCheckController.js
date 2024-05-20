// const { ApiResponse } = require("../utils/ApiResponse");
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = (req, res) => {
  res.status(200).json(new ApiResponse(200, "OK", "Server is up and running"));
};

export { healthCheck };
