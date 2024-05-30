const bcrypt = require("bcrypt");
const User = require("../models/user");
const { describe, test, beforeEach } = require("node:test");
const assert = require("node:assert");
const helper = require("../utils/test_helper");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);

describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("testPassword", 10);
    const user = new User({
      username: "root",
      name: "Super User",
      passwordHash,
    });

    await user.save();
  });
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: "simppa",
      name: "Simo Tinkkane",
      password: "testpw1234",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = await usersAtEnd.map((user) => user.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await User.find({});
    const newUser = {
      username: "root",
      name: "Super User",
      password: "dondo",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes("expected `username` to be unique"));
    assert(usersAtEnd.length, usersAtStart.length);
  });
});

describe("creation fails with incorrect credentials", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  test("throw error if username is missing", async () => {
    const usersAtStart = await User.find({});
    const newUser = {
      name: "root",
      password: "testpassword1234",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await User.find({});
    assert(result.body.error.includes("username is missing"));
    assert.strictEqual(usersAtStart.length, usersAtEnd.length);
  });

  test("username is less than 3 characters", async () => {
    const usersAtStart = await User.find({});
    const newUser = {
      name: "root",
      username: "gg",
      password: "testpassword1234",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(
      result.body.error.includes("expected `username` to have min 3 characters")
    );
    assert.strictEqual(usersAtStart.length, usersAtEnd.length);
  });

  test("throw error if password is missing", async () => {
    const usersAtStart = await User.find({});
    const newUser = {
      name: "root",
      username: "Super User",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await User.find({});
    assert(result.body.error.includes("password is missing"));
    assert.strictEqual(usersAtStart.length, usersAtEnd.length);
  });

  test("password is less than 3 characters", async () => {
    const usersAtStart = await User.find({});
    const newUser = {
      name: "root",
      username: "Super User",
      password: "gg",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await User.find({});
    assert(
      result.body.error.includes("expected `password` to have min 3 characters")
    );
    assert.strictEqual(usersAtStart.length, usersAtEnd.length);
  });
});
