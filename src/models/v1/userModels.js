import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ACTIONS } from "../../constants.js";
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
      .input("ActionName", USER_ACTIONS.GET)
      .input("UserID", userID)
      .execute("sp_Users_SEL");

    const user = request.recordset[0];
    const accessToken = generateAccessToken(user);
    return accessToken;
  } catch (error) {
    throw new ApiError(500, "Internal server error while generation token");
  }
};

const onLoginUser = async (actionName, username) => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", actionName)
      .input("Username", username)
      .execute("dbo.sp_Users_login");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

export { generateHashPassword, generateToken, isPasswordCorrect, onLoginUser };
