import bcrypt from "bcrypt";
import { logger } from "../../config/logConfig.js";
import { USER_ACTIONS } from "../../constants.js";
import {
  generateToken,
  isPasswordCorrect,
  onLoginUser,
  onLogoutUser,
} from "../../models/v1/userModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getOSByReq, getReqIpAddressByReq } from "../../utils/requestInfo.js";

const existUser = async (req, res) => {
  const { username } = req.params;
  res.send({
    isExist: true,
    username,
  });
};

const registerUser = async (req, res) => {
  const { name } = req.body;
  const encodedName = await bcrypt.hash(name, 10);
  const compareName = await bcrypt.compare(
    name,
    "$2b$10$jJebbOMRmYZXAr40UAiDu.1jv5yMio16pqNgMhYy13XbRQTEGE6h6"
  );
  res.send({
    encodedName,
    compareName,
    message: "User registered successfully",
  });
};

const loginUser = async (req, res) => {
  try {
    const body = req.body;
    const username = body?.Username;
    const password = body?.Password;

    if (!username && !password) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "Username or password is required!"));
    }

    const findUser = await onLoginUser(USER_ACTIONS.LOGIN_FIND, username);
    if (!findUser) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "User does not exist!"));
    }

    if (!findUser[0].Password) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "User does not exist!"));
    }

    const isValidPassword = await isPasswordCorrect(
      password,
      findUser[0].Password
    );

    if (!isValidPassword) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "Username or password does not match"));
    }

    const ipAddress = getReqIpAddressByReq(req);
    const os = getOSByReq(req);
    const user = await onLoginUser(USER_ACTIONS.LOGIN, username, os, ipAddress);

    if (!user) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "Username or password does not match"));
    }

    if (!user[0]?.UserID) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "Username or password does not match"));
    }

    const token = await generateToken(user[0]?.UserID);
    const newUser = {
      token,
      ...user,
    };

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("token", token, options)
      .json(new ApiResponse(200, newUser, "Login successful"));
  } catch (error) {
    // logger.error(error);
    logger.error(error);
    console.log(error.stack);

    return res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error!"
        )
      );
  }
};

const logoutUser = async (req, res) => {
  try {
    const body = req.body;
    const userID = body?.UserID;
    const sessionID = body?.SessionID;

    if (!userID && !sessionID) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "UserID or SessionID is required!"));
    }

    await onLogoutUser(userID, sessionID);

    return res
      .status(200)
      .clearCookie("token", { maxAge: 0, secure: true })
      .json(new ApiResponse(200, "SUCCESS", "Successfully logged out"));
  } catch (error) {
    logger.error(error);
    console.log(error.stack);
    return res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error!"
        )
      );
  }
};

export { existUser, loginUser, logoutUser, registerUser };
