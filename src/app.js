import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server as socketIO } from "socket.io";
import morganMiddleware from "./middlewares/morganMiddleware.js";

const app = express();
const server = createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "http://192.168.1.166:3000",
    ],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "http://192.168.1.166:3000",
    ],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));

app.use(morganMiddleware);

// Imports
import { errorHandler } from "./middlewares/errorMiddlewares.js";
import healthCheckRouter from "./routes/healthCheckRoutes.js";
import v1Router from "./routes/v1/index.js";
import { initializeSocketIO } from "./socket/index.js";

app.use("/", healthCheckRouter);
app.use("/api/v1", v1Router);

initializeSocketIO(io);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handler
app.use(errorHandler);

export { server };
