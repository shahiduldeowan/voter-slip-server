import { poolPromise } from "../../db/index.js";

const onAllRoles = async () => {
  try {
    const request = await poolPromise.request().execute("dbo.sp_Roles_Select");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

export { onAllRoles };
