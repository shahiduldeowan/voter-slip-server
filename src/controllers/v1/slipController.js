import { logger } from "../../config/logConfig.js";
import { SOCKET_EVENT_ENUM } from "../../constants.js";
import {
  onSlipIssue,
  onSlipQueue,
  onSlipReset,
} from "../../models/v1/slipModels.js";
import {
  findSingleVoterByQuery,
  onVoterCounts,
} from "../../models/v1/voterModels.js";
import { emitSocketEvent } from "../../socket/index.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import pdfService from "../../utils/pdfService.js";

const getSlip = async (req, res) => {
  try {
    const voterAccountNumber = req.params.AccountNumber;
    const voter = await findSingleVoterByQuery(voterAccountNumber, true);
    if (!voter) {
      return res.status(404).json(new ApiJsonError(404, "Voter not found"));
    }

    const userID = req.user?.UserID;
    const slipResponse = await onSlipIssue(userID, voterAccountNumber);

    if (!slipResponse?.AccountNumber) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "Something went wrong"));
    }

    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=slip.pdf",
    });

    const queueList = await onSlipQueue();
    const voterCounts = await onVoterCounts();

    emitSocketEvent(req, SOCKET_EVENT_ENUM.SLIP_ISSUE_QUEUE_EVENT, queueList);
    emitSocketEvent(req, SOCKET_EVENT_ENUM.VOTER_COUNT_EVENT, voterCounts);

    pdfService(
      voter,
      (chunk) => stream.write(chunk),
      () => stream.end()
    );
  } catch (error) {
    logger.error(error.message);
    console.log(error.stack);

    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const getSlipQueueList = async (req, res) => {
  try {
    const queueList = await onSlipQueue();
    return res.status(200).json(new ApiResponse(200, queueList, "SUCCESS"));
  } catch (error) {
    logger.error(error.message);
    console.log(error.stack);

    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error"
        )
      );
  }
};

const slipReset = async (req, res) => {
  try {
    const voterID = await onSlipReset(req.user?.UserID, req.params?.VoterID);
    const queueList = await onSlipQueue();
    const voterCounts = await onVoterCounts();

    emitSocketEvent(req, SOCKET_EVENT_ENUM.SLIP_ISSUE_QUEUE_EVENT, queueList);
    emitSocketEvent(req, SOCKET_EVENT_ENUM.VOTER_COUNT_EVENT, voterCounts);

    return res
      .status(200)
      .json(new ApiResponse(200, { VoterID: voterID }, "SUCCESS"));
  } catch (error) {
    logger.error(error.message);
    console.log(error.stack);

    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error"
        )
      );
  }
};

export { getSlip, getSlipQueueList, slipReset };
