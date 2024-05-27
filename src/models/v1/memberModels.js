import { DB_ACTIONS } from "../../constants.js";
import { poolPromise } from "../../db/index.js";

const onCreateMember = async (member, userID) => {
  try {
    const request = await poolPromise
      .request()
      .input("SerialNumber", member["Sl #"])
      .input("Name", member["Name"])
      .input("PhoneNumber", member["Mobile"])
      .input("RFID", member["RFID"])
      .input("Email", member["Email"])
      .input("AccountNumber", member["A/C #"])
      .input("InsertedByUserID", userID)
      .execute("dbo.sp_Voters_Insert");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

const onSelectMembers = async () => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", DB_ACTIONS.GET)
      .execute("dbo.sp_Voters_Select");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

export { onCreateMember, onSelectMembers };
