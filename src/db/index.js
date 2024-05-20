import sql from "mssql";
import { config } from "../config/dbConfig.js";
import { logger } from "../config/logConfig.js";

const { ConnectionPool } = sql;

const poolPromise = new ConnectionPool(config);

async function connectToDatabase() {
  return poolPromise.connect();
}

poolPromise.on("error", (err) => {
  logger.error(`Database connection failed ${err.message}`);
});

export { connectToDatabase, poolPromise };
