import dotenv from "dotenv";
import { app } from "./app.js";
import { logger } from "./config/logConfig.js";
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`⚙️ Server is running at port : ${process.env.PORT}`);
});
