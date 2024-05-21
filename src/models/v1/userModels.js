import { poolPromise } from "../../db/index.js";

const onLoginUser = async (actionName, username) => {
  try {
    const result = await poolPromise
      .request()
      .input("ActionName", actionName)
      .input("Username", username)
      .execute("dbo.sp_Users_login");

    return result.recordset;
  } catch (error) {
    throw error;
  }
};

export { onLoginUser };
