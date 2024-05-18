import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, json } = format;

const myFormat = printf(({ level, message, timestamp, context }) => {
  const localTimestamp = new Date(timestamp).toLocaleString();
  let logMessage = `${localTimestamp} [${level}] - ${message}`;
  if (context) {
    logMessage += `${JSON.stringify(context, null, 2)}`;
  }

  return logMessage;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "info",
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.File({
      filename: "app.log",
      maxsize: 1024 * 1024 * 10,
      maxFiles: 5,
    }),
    new transports.Console({ format: json() }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
});

const appLog = (message) => {
  if (process.env.NODE_ENV === "production") {
    console.log(message);
  }
};

export { appLog, logger };
