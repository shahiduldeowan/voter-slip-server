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

const isUserExistInDB = async (username) => {
  const request = await poolPromise
    .request()
    .input("ActionName", DB_ACTIONS.IS_USER_EXIST)
    .input("Username", username)
    .execute("dbo.sp_Users_SEL");

  const result = request.recordset;

  return result && result.length > 0 && result[0]?.IsUserExist === 1;
};

/**
 * Registers a new user in the database.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} user.UserID - The unique identifier for the user.
 * @param {string} user.Username - The username of the user.
 * @param {string} user.Password - The password of the user.
 * @param {string} user.Email - The email of the user.
 * @param {string} user.FirstName - The first name of the user.
 * @param {string} user.LastName - The last name of the user.
 * @param {number} user.RoleID - The role ID of the user.
 * @param {string} user.Avatar - The avatar URL of the user.
 *
 * @returns {Promise<number|null>} - A promise that resolves to the user ID if registration is successful, otherwise null.
 *
 * @throws {Error} - If any error occurs during the registration process.
 */
const onRegisterUser = async (user) => {
  try {
    const request = await poolPromise
      .request()
      .input("UserID", user?.UserID)
      .input("Username", user?.Username)
      .input("Password", user?.Password)
      .input("Email", user?.Email)
      .input("FirstName", user?.FirstName)
      .input("LastName", user?.LastName)
      .input("RoleID", user?.RoleID)
      .input("Avatar", user?.Avatar)
      .execute("dbo.sp_Users_Insert");

    const result = request.recordset;
    if (result && result.length > 0 && result[0]?.UserID) {
      return result[0]?.UserID;
    }

    return null;
  } catch (error) {
    throw error;
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

const onGetAllUsers = async () => {
  const request = await poolPromise
    .request()
    .input("ActionName", DB_ACTIONS.GET_ALL_USERS)
    .execute("dbo.sp_Users_SEL");

  return request.recordset;
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
  isUserExistInDB,
  onGetAllUsers,
  onGetUser,
  onLoginUser,
  onLogoutUser,
  onRegisterUser,
};
