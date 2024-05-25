const healthCheck = (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Server is up and running",
  };
  res.status(200).json(health);
};

export { healthCheck };
