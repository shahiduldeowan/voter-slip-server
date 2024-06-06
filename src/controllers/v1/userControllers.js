import { logger } from "../../config/logConfig.js";
import { COOKIE_OPTIONS, DB_ACTIONS } from "../../constants.js";
import {
  generateHashPassword,
  generateToken,
  isPasswordCorrect,
  isUserExistInDB,
  onGetAllUsers,
  onGetUser,
  onLoginUser,
  onLogoutUser,
  onRegisterUser,
} from "../../models/v1/userModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getOSByReq, getReqIpAddressByReq } from "../../utils/requestInfo.js";

const existUser = async (req, res) => {
  try {
    const { username } = req.params;
    const isExistUser = await isUserExistInDB(username);
    return res.status(200).json(
      200,
      {
        isExistUser: isExistUser === 1 ? true : false,
      },
      isExistUser === 1 ? "User exist" : "User not exist"
    );
  } catch (error) {
    logger.error(error.message || "Internal server error");
    console.log(error.stack);
    return res.status(500).json(new ApiJsonError(500, "Internal server error"));
  }
};

const registerUser = async (req, res) => {
  try {
    const { Username, Password, FirstName, LastName, Email, RoleID } = req.body;

    if (!Username && !Password) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "Username or password is required!"));
    }

    if (!FirstName && !LastName) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "First name or last name is required!"));
    }

    if (!RoleID) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "Role ID is required!"));
    }

    const isExistUser = await isUserExistInDB(Username);
    if (isExistUser) {
      return res.status(404).json(new ApiJsonError(404, "User already exist!"));
    }

    const hashPassword = await generateHashPassword(Password);

    const newUser = {
      UserID: req.user?.UserID,
      Username,
      Password: hashPassword,
      FirstName,
      LastName,
      Email,
      RoleID,
    };

    const registerUserID = await onRegisterUser(newUser);

    if (!registerUserID) {
      return res
        .status(500)
        .json(new ApiJsonError(500, "Error registering user"));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          UserID: registerUserID,
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    logger.error(error.message || "Error registering user");
    console.log(error.stack);

    res.status(500).json(new ApiJsonError(500, "Error registering user"));
  }
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

    const findUser = await onLoginUser(DB_ACTIONS.LOGIN_FIND, username);
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
    const users = await onLoginUser(DB_ACTIONS.LOGIN, username, os, ipAddress);

    if (!users) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "Username or password does not match"));
    }
    const user = users[0];
    if (!user?.UserID) {
      return res
        .status(401)
        .json(new ApiJsonError(401, "Username or password does not match"));
    }

    const token = await generateToken(user?.UserID);

    const newUser = {
      token,
      ...user,
    };

    return res
      .status(200)
      .cookie("token", token, COOKIE_OPTIONS)
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

const authUserStatus = async (req, res) => {
  try {
    const userID = req.user?.UserID;
    const users = await onGetUser(userID);
    if (!users) {
      return res
        .status(404)
        .json(new ApiJsonError(404, "User does not exist!"));
    }

    const token =
      req?.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    const user = users[0];

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          token,
          ...user,
        },
        "User found"
      )
    );
  } catch (error) {
    logger.error(error.message || "Internal server error!");
    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error!"
        )
      );
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await onGetAllUsers();

    return res.status(200).json(new ApiResponse(200, allUsers, "User found"));
  } catch (error) {
    logger.error(error.message || "Internal server error!");
    console.log(error.stack);

    res
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
    const userID = req?.user?.UserID;
    const sessionID = req?.user?.SessionID;

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

export {
  authUserStatus,
  existUser,
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
};
