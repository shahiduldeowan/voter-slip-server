import { ConnectionPool } from "mssql";
import config from "../config/dbConfig.js";
import { logger } from "../config/logConfig.js";

const poolPromise = new ConnectionPool(config);

const connectToDB = async () => poolPromise.connect();

poolPromise.on("error", (err) => {
  logger.error(`Database connection failed ${err.message}`);
});

export { connectToDB, poolPromise };
