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

  test("entries in database don't have _id or __v values", async () => {
    try {
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.body._id, undefined);
      assert.strictEqual(response.body.__v, undefined);
    } catch (error) {
      throw error;
    }
  });
  test("entries contain a key 'id'", async () => {
    try {
      const response = await api.get("/api/blogs");
      const keys = Object.keys(response.body[0]);
      assert.strictEqual(keys.includes("id"), true);
    } catch (error) {
      throw error;
    }
  });
  test("post operation increases the database length by 1", async () => {
    try {
      const response = await api.get("/api/blogs");

      const blog = {
        title: "Road to internship",
        author: "Teppo Kolehmainen",
        url: "www.blogspot.com/roadtointernship",
        likes: 3,
      };

      const request = await api.post("/api/blogs").send(blog);
      const afterPosting = await api.get("/api/blogs");
      assert.deepStrictEqual(request.status, 201);
      assert.deepStrictEqual(
        afterPosting.body.length,
        response.body.length + 1
      );
    } catch (error) {
      throw error;
    }
  });

  test("Blog object has default value 0 for likes if no value is given", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
      likes: null
    };
    // const response = await api.get("/api/blogs")
    const request = await api.post("/api/blogs").send(blog);

    assert.deepStrictEqual(request.status, 201)
    assert.deepStrictEqual(request.body.likes, 0)
  });
  test("Blog object has default value 0 for likes key 'likes' is missing", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
    };
    const request = await api.post("/api/blogs").send(blog);

    assert.deepStrictEqual(request.status, 201)
    assert.deepStrictEqual(request.body.likes, 0)
  });
});
