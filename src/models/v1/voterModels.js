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
const findSingleVoterByQuery = async (query) => {
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
        ? `${serverIP}:${port}/${voter?.PhotoURL}`
        : null;

      const myVoter = {
        Name: voter?.Name,
        AccountNumber: voter?.AccountNumber,
        SerialNumber: voter?.SerialNumber,
        PhotoURL: photoURL,
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

export { findSingleVoterByQuery };
