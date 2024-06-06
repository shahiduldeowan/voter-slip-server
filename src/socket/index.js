import cookie from "cookie";
import jwt from "jsonwebtoken";
import { SOCKET_EVENT_ENUM } from "../constants.js";
import { onGetUser } from "../models/v1/userModels.js";
import { isSlipQueueAccess } from "../utils/userPermission.js";

/**
 * Initializes the socket.io server and handles socket connections.
 *
 * @param {Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} io - The socket.io server instance.
 * @returns {Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} - Returns the socket.io server instance.
 */
const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      let token = cookies?.token;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodeToken?.UserID && !decodeToken?.SessionID) {
        return socket.emit(
          SOCKET_EVENT_ENUM.SOCKET_ERROR_EVENT,
          "Unauthorized user"
        );
      }

      const reqUser = await onGetUser(decodeToken?.UserID);

      if (
        !reqUser[0]?.UserID &&
        !reqUser[0].SessionID &&
        !reqUser[0].RoleName
      ) {
        return socket.emit(
          SOCKET_EVENT_ENUM.SOCKET_ERROR_EVENT,
          "Unauthorized user"
        );
      }

      if (!isSlipQueueAccess(reqUser[0])) {
        return socket.emit(
          SOCKET_EVENT_ENUM.SOCKET_ERROR_EVENT,
          "Access denied"
        );
      }

      socket.emit(SOCKET_EVENT_ENUM.CONNECTED_EVENT);
      console.log("User connected 🔗.");

      socket.on(SOCKET_EVENT_ENUM.DISCONNECTED_EVENT, () => {
        console.log("User has disconnected 🚫.");
      });
    } catch (error) {
      socket.emit(
        SOCKET_EVENT_ENUM.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

/**
 *
 * @param {import("express").Request} req - Request object to access the `io` instance set at the entry point
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
const emitSocketEvent = (req, event, payload) => {
  req.app.get("io").emit(event, payload);
};

export { emitSocketEvent, initializeSocketIO };
