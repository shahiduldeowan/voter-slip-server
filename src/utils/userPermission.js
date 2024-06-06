import { USER_ROLE } from "../constants.js";

const isSlipQueueAccess = (user) => {
  if (!user) return false;

  return (
    user?.RoleName === USER_ROLE.ADMIN ||
    user?.RoleName === USER_ROLE.SUPERVISOR ||
    user?.RoleName === USER_ROLE.VIEWER
  );
};

export { isSlipQueueAccess };
