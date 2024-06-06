import { DB_ACTIONS } from "../../constants.js";
import { poolPromise } from "../../db/index.js";
import { getServerIP } from "../../utils/serverInfo.js";

/**
 * This function is used to find a single voter record in the database based on a given query.
 *
 * @param {Object} query - The query can be RFID/AccountNumber to search for a voter.
 * @returns {Promise<Object|null>} - A promise that resolves to the found voter object or null if not found.
 * @throws {Error} - If an error occurs during the database operation.
 */
const findSingleVoterByQuery = async (query, isForSlip) => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", DB_ACTIONS.FIND_ONE)
      .input("Query", query)
      .execute("dbo.sp_Voters_Select");

    const result = request.recordset;

    if (result && result.length > 0) {
      const voter = result[0];
      const serverIP = getServerIP();
      const port = process.env.PORT || 8000;
      const photoURL = voter?.PhotoURL
        ? `http://${serverIP}:${port}/${voter?.PhotoURL}`
        : null;

      const myVoter = {
        Name: voter?.Name,
        AccountNumber: voter?.AccountNumber,
        SerialNumber: voter?.SerialNumber,
        PhotoURL: isForSlip ? voter?.PhotoURL : photoURL,
        SlipStatus: voter?.SlipStatus,
        CounterNumber: voter?.CounterNumber,
      };

      return myVoter;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const onVoterCounts = async () => {
  const request = await poolPromise.request().execute("dbo.sp_Voters_Count");

  const result = request.recordset;
  if (result && result.length > 0) {
    return result[0];
  }
  return null;
};

export { findSingleVoterByQuery, onVoterCounts };
