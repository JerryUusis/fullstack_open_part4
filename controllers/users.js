const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

// Create a new user
usersRouter.post("/", async (request, response) => {
  try {
    const { username, name, password } = request.body;

    if (password === undefined) {
      return response.status(400).json({ error: "password is missing" });
    } else if (password.length < 3) {
      return response
        .status(400)
        .json({ error: "expected `password` to have min 3 characters" });
    }
    if (username === undefined) {
      return response.status(400).json({ error: "username is missing" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    if (
      error.name === "MongoServerError" &&
      error.message.includes("E11000 duplicate key error")
    ) {
      return response
        .status(400)
        .json({ error: "expected `username` to be unique" });
    } else if (
      error.name === "ValidationError" &&
      error.message.includes("Path `username`")
    ) {
      return response
        .status(400)
        .json({ error: "expected `username` to have min 3 characters" });
    } else {
      console.error(error);
      throw error;
    }
  }
});

usersRouter.get("/", async (request, response) => {
  try {
    const users = await User.find({});
    response.json(users);
  } catch (error) {
    console.error(error);
    throw error;
  }
});

module.exports = usersRouter;
