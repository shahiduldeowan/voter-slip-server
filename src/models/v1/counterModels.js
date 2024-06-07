import { poolPromise } from "../../db/index.js";

const onSelectCounters = async () => {
  const request = await poolPromise
    .request()
    .execute("dbo.sp_VoterCounters_Select");

  if (request.recordsets && request.recordsets.length > 0) {
    return request.recordsets[0];
  }
  return [];
};

const onInsertCounter = async (userID, counter) => {
  const request = await poolPromise
    .request()
    .input("UserID", userID)
    .input("StartSerial", counter?.StartSerial)
    .input("EndSerial", counter?.EndSerial)
    .input("Counter", counter?.Counter)
    .execute("dbo.sp_VoterCounters_Insert");

  return request.recordsets;
};

export { onInsertCounter, onSelectCounters };
