import morgan from "morgan";
import { skip, stream } from "../config/morganLoggerConfig.js";

const morganMiddleware = morgan(
  ":remote-addr :method :url :status - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;
