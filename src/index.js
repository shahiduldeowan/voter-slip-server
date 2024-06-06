import dotenv from "dotenv";
import { server } from "./app.js";
import { logger } from "./config/logConfig.js";
import { connectToDatabase } from "./db/index.js";
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const PORT = process.env.PORT || 8000;

// Database Connection
connectToDatabase()
  .then(() => {
    logger.info(`Database connection successful`);
  })
  .catch((err) => {
    logger.error(`Database connection failed ${err.message}`);
  });

server.listen(PORT, () => {
  logger.info(`⚙️ Server is running on port: ${PORT}`);
  console.log(`⚙️ Server is running on port: ${PORT}`);
});
