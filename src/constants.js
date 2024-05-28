const DB_NAME = "VoterSlipDB";

const DB_ACTIONS = {
  LOGIN_FIND: "USER_FIND",
  LOGIN: "USER_LOGIN",
  GET: "GET",
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

export { COOKIE_OPTIONS, DB_ACTIONS, DB_NAME };
