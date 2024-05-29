const express = require("express");
const app = express();
const blogRouter = require("./controllers/blog");
const usersRouter = require("./controllers/users");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");

mongoose
  .connect(config.MONGODB_STRING)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((error) => {
    "Error connecting to mongodb:", error.message;
  });

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRouter);
app.use("/api/users", usersRouter);

module.exports = app;
