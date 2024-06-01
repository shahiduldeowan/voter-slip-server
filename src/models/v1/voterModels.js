import { DB_ACTIONS } from "../../constants.js";
import { poolPromise } from "../../db/index.js";

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

    if (result && result.length > 0) return result[0];
    return null;
  } catch (error) {
    throw error;
  }
};

export { findSingleVoterByQuery };
