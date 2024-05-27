import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DB_ACTIONS } from "../../constants.js";
import { poolPromise } from "../../db/index.js";
import { ApiError } from "../../utils/ApiError.js";

// Generate a random hash from the given password
const generateHashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Password checker function for password
const isPasswordCorrect = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate access token from the given user information
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      UserID: user.UserID,
      Username: user.Username,
      Email: user.Email,
      RoleName: user.RoleName,
      SessionID: user.SessionID,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

// Generate token
const generateToken = async (userID) => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", DB_ACTIONS.GET)
      .input("UserID", userID)
      .execute("sp_Users_SEL");

    const user = request.recordset[0];
    const accessToken = generateAccessToken(user);
    return accessToken;
  } catch (error) {
    throw new ApiError(500, "Internal server error while generation token");
  }
};

// Login user
const onLoginUser = async (actionName, username, os, ip) => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", actionName)
      .input("Username", username)
      .input("OS", os)
      .input("IPAddress", ip)
      .execute("dbo.sp_Users_login");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

// Get user
const onGetUser = async (userID) => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", DB_ACTIONS.GET)
      .input("UserID", userID)
      .execute("dbo.sp_Users_SEL");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

// Logout user
const onLogoutUser = async (userID, sessionID) => {
  try {
    const request = await poolPromise
      .request()
      .input("UserID", userID)
      .input("SessionID", sessionID)
      .execute("dbo.sp_Users_Logout");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

export {
  generateHashPassword,
  generateToken,
  isPasswordCorrect,
  onGetUser,
  onLoginUser,
  onLogoutUser,
};
