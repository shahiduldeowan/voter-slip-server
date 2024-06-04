import { DB_ACTIONS } from "../../constants.js";
import { poolPromise } from "../../db/index.js";
import { getServerIP } from "../../utils/serverInfo.js";

/**
 * This function is responsible for inserting a new record into the voters slip table.
 * It takes two parameters: userID and voterAccountNumber.
 *
 * @param {number} userID - The ID of the user who is issuing the slip.
 * @param {string} voterAccountNumber - The account number of the voter.
 *
 * @returns {string} - A message indicating the success or failure of the operation.
 * If the operation is successful, it returns the message from the stored procedure.
 * If the operation fails, it returns a generic error message.
 */
const onSlipIssue = async (userID, voterAccountNumber) => {
  const request = await poolPromise
    .request()
    .input("AccountNumber", voterAccountNumber)
    .input("UserID", userID)
    .execute("dbo.sp_VotersSlip_Insert");

  const result = request.recordset;
  if (result && result.length > 0) {
    return result[0];
  }

  return null;
};

/**
 * This function retrieves a list of voter slips that are currently in the queue.
 * It connects to the database, executes a stored procedure, and maps the result to a list of objects.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of objects representing the voter slips in the queue.
 * Each object contains the following properties: Name, AccountNumber, PhotoURL, Counter, and IssueDate.
 * If there are no voter slips in the queue, the promise resolves to an empty array.
 */
const onSlipQueue = async () => {
  const request = await poolPromise
    .request()
    .input("ActionName", DB_ACTIONS.SLIP_QUEUE)
    .execute("dbo.sp_VoterSlips_Select");

  const result = request.recordset;
  if (result && result.length > 0) {
    const serverIP = getServerIP();
    const port = process.env.PORT || 8000;

    const queueList = result?.map((queue) => {
      const photoURL = queue?.PhotoURL;
      const genPhotoURL = photoURL
        ? `http://${serverIP}:${port}/${photoURL}`
        : photoURL;

      return {
        Name: queue.Name,
        AccountNumber: queue.AccountNumber,
        PhotoURL: genPhotoURL,
        Counter: queue.Counter,
        IssueDate: queue.IssueDate,
      };
    });

    return queueList;
  }

  return [];
};

export { onSlipIssue };
