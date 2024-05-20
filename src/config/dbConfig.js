const config = {
  driver: process.env.DB_DRIVER,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustedConnection: false,
    enableArithAbort: false,
  },
};

export default config;
