import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Imports
import { errorHandler } from "./middlewares/errorMiddlewares.js";
import healthCheckRouter from "./routes/healthCheckRoutes.js";
import v1Router from "./routes/v1/index.js";

app.use("/", healthCheckRouter);
app.use("/api/v1", v1Router);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handler
app.use(errorHandler);

export { app };
