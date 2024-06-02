import { poolPromise } from "../../db/index.js";

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
    return request[0]?.Message || "Failed to slip issue";
  }

  return "Failed to slip issue";
};

export { onSlipIssue };
