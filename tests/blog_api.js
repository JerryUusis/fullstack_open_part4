const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const Blog = require("../models/blog");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
];

describe("api", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save();
    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save();
  });

  test("blogs are returned as json", async () => {
    try {
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers["content-type"],
        "application/json; charset=utf-8"
      );
    } catch (error) {
      throw error;
    }
  });

  test("database is empty after deleting all", async () => {
    try {
      await Blog.deleteMany({});
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 0);
    } catch (error) {
      throw error;
    }
  });

  test("database is populated with two entries", async () => {
    try {
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 2);
    } catch (error) {
      throw error;
    }
  });

  test("database returns 1 note after deleting one", async () => {
    try {
      await Blog.deleteOne({ author: "Michael Chan" });
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 1);
    } catch (error) {
      throw error;
    }
  });
});
