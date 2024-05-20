import { ConnectionPool } from "mssql";
import config from "../config/dbConfig.js";

const poolPromise = new ConnectionPool(config);

const connectToDB = async () => poolPromise.connect();

export { connectToDB, poolPromise };
