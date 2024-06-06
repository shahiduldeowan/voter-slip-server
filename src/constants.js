const DB_NAME = "VoterSlipDB";

const DB_ACTIONS = {
  LOGIN_FIND: "USER_FIND",
  LOGIN: "USER_LOGIN",
  GET_ALL_USERS: "GET_ALL_USERS",
  GET: "GET",
  UPDATE_PHOTO_URL: "UPDATE_PHOTO_URL",
  FIND_ONE: "FIND_ONE",
  SLIP_QUEUE: "SLIP_QUEUE",
  SLIP_RESET: "SLIP_RESET",
  IS_USER_EXIST: "IS_USER_EXIST",
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

const SOCKET_EVENT_ENUM = Object.freeze({
  CONNECTED_EVENT: "connected",
  DISCONNECTED_EVENT: "disconnect",
  SLIP_ISSUE_QUEUE_EVENT: "slip_issue_queue",
  SOCKET_ERROR_EVENT: "socket_error",
  VOTER_COUNT_EVENT: "voter_counts",
});

const USER_ROLE = {
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operator",
  VIEWER: "Viewer",
};

export { COOKIE_OPTIONS, DB_ACTIONS, DB_NAME, SOCKET_EVENT_ENUM, USER_ROLE };
