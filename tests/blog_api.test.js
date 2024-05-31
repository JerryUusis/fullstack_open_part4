const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const Blog = require("../models/blog");
const User = require("../models/user");
const supertest = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const config = require("../utils/config");
const helper = require("../utils/test_helper");

const api = supertest(app);

describe("get operations", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test("blogs are returned as json", async () => {
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.status, 200);
    assert.strictEqual(
      response.headers["content-type"],
      "application/json; charset=utf-8"
    );
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    const db = await helper.blogsInDb();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.length, db.length);
  });

  test("query with an id returns one object with matching id", async () => {
    const db = await helper.blogsInDb();
    const response = await api.get(`/api/blogs?id=${db[0].id}`);

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(db[0], response.body);
  });

  test("query with nonexisting id returns status 404", async () => {
    const response = await api.get(`/api/blogs/${helper.nonExistingId}`);
    assert.strictEqual(response.status, 404);
  });

  test("blog title can be found from returned blogs", async () => {
    const response = await api.get("/api/blogs");

    const contents = response.body.map((r) => r.title);
    assert(contents.includes("React patterns"));
  });

  test("database is empty after deleting all", async () => {
    await Blog.deleteMany({});
    const db = await Blog.find({});
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.status, 200);
    assert.strictEqual(db.length, 0);
  });

  test("database returns 1 blog after deleting one", async () => {
    await Blog.deleteOne({ author: "Michael Chan" });
    const db = await Blog.find({});
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.status, 200);
    assert.strictEqual(db.length, 1);
  });

  test("entries in database don't have _id or __v values", async () => {
    const response = await api.get("/api/blogs");
    for (const blog of response.body) {
      assert.strictEqual(response.status, 200);
      assert.strictEqual(blog.__v, undefined);
      assert.strictEqual(blog._id, undefined);
    }
  });

  test("entries contain a key 'id'", async () => {
    const response = await api.get("/api/blogs");
    const keys = Object.keys(response.body[0]);
    assert.strictEqual(keys.includes("id"), true);
  });
});

describe("adding a new blog", () => {
  // Emulates the jwt token that is required to post new blogs
  let token;
  beforeEach(async () => {
    // Delete all entries from users and blogs collections
    await mongoose.connect(config.MONGODB_STRING);
    await Blog.deleteMany({});
    await User.deleteMany({});

    const newUser = {
      name: "Test User",
      username: "testuser",
      password: "test1234",
    };

    // Create new user and login.
    // Assign token value from loginResponse and set it in the Authorization header in tests
    await api.post("/api/users").send(newUser);
    const loginResponse = await api
      .post("/api/login")
      .send({ username: "testuser", password: "test1234" });
    token = loginResponse.body.token;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test("post operation increases the database length by 1", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
      likes: 3,
    };
    const initialDB = await helper.blogsInDb();
    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);
    const afterPost = await helper.blogsInDb();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(afterPost.length, initialDB.length + 1);
  });

  test("Blog object has default value 0 for likes if likes is undefined", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
      likes: undefined,
    };
    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.likes, 0);
  });

  test("Blog object has default value 0 for likes key 'likes' is missing", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
    };
    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.likes, 0);
  });

  test("blog is not added if Blog object is missing key 'title'", async () => {
    const blog = {
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
      likes: 4,
    };
    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.res.text, "bad request");
  });

  test("blog is not added if Blog object is missing key 'url'", async () => {
    const blog = {
      author: "Teppo Kolehmainen",
      title: "Road to internship",
      likes: 4,
    };
    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.res.text, "bad request");
  });

  test("blog is not added if Blog object is missing key 'title' and 'url'", async () => {
    const blog = {
      author: "Teppo Kolehmainen",
      likes: 4,
    };
    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.res.text, "bad request");
  });
});

describe("deletion of a blog", () => {
  beforeEach(async () => {
    await mongoose.connect(config.MONGODB_STRING);
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  after(async () => {
    mongoose.connection.close();
  });

  test("server deletes one blog with id", async () => {
    const blogInDb = await helper.blogsInDb();
    const response = await api.delete(`/api/blogs/${blogInDb[0].id}`);
    // Database length changes after deletion
    const db = await helper.blogsInDb();

    assert.strictEqual(response.status, 204);
    assert.strictEqual(helper.initialBlogs.length - 1, db.length);
  });

  test("server returns status 404 with non-existing id", async () => {
    const nonExistingId = await helper.nonExistingId();
    const response = await api.delete(`/api/blogs/${nonExistingId}`);
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.text, "not found");
  });
});

describe("updating a blog", () => {
  beforeEach(async () => {
    await mongoose.connect(config.MONGODB_STRING);
    await Blog.deleteMany();
    await Blog.insertMany(helper.initialBlogs);
  });
  after(async () => {
    mongoose.connection.close();
  });

  test("succesful update with id", async () => {
    const blogs = await Blog.find({});
    const blog = blogs[0];
    const initialLikes = blog.likes;

    const response = await api
      .put(`/api/blogs/${blog.id}`)
      .send({ likes: blog.likes + 1 });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(initialLikes + 1, response.body.likes);
  });

  test("server returns status 404 with non-existing id", async () => {
    const nonExistingId = await helper.nonExistingId();
    const response = await api
      .put(`/api/blogs/${nonExistingId}`)
      .send({ likes: 11 });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.text, "not found");
  });
});
