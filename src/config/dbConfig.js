import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const config = {
  driver: process.env.DB_DRIVER,
  server: process.env.DB_SERVER,
  database: DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    enableArithAbort: false,
  },
};

export { config };
