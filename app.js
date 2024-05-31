const express = require("express");
const app = express();
require("express-async-errors");
const blogRouter = require("./controllers/blog");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const cors = require("cors");
const middleware = require("./utils/middleware");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");

mongoose.set("strictQuery", false);

logger.info("Connecting to mongodb");

mongoose
  .connect(config.MONGODB_STRING)
  .then(() => {
    logger.info("Connected to mongodb");
  })
  .catch((error) => {
    logger.error("Error connecting to mongodb:", error.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use("/api/blogs", blogRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
