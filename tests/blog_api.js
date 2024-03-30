const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const Blog = require("../models/blog");
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

  test("all blogs are returned", async () => {
    try {
      const response = await api.get("/api/blogs");
      const db = await helper.blogsInDb();
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, db.length);
    } catch (error) {
      throw error;
    }
  });

  test("query with an id returns one object with matching id", async () => {
    try {
      const db = await helper.blogsInDb();
      const response = await api.get(`/api/blogs?id=${db[0].id}`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(db[0], response.body);
    } catch (error) {
      throw error;
    }
  });

  test("query with nonexisting id returns status 404", async () => {
    try {
      const response = await api.get(`/api/blogs/${helper.nonExistingId}`);
      assert.strictEqual(response.status, 404);
    } catch (error) {
      throw error;
    }
  });

  test("blog title can be found from returned blogs", async () => {
    try {
      const response = await api.get("/api/blogs");

      const contents = response.body.map((r) => r.title);
      assert(contents.includes("React patterns"));
    } catch (error) {
      throw error;
    }
  });

  test("database is empty after deleting all", async () => {
    try {
      await Blog.deleteMany({});
      const db = await Blog.find({});
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.status, 200);
      assert.strictEqual(db.length, 0);
    } catch (error) {
      throw error;
    }
  });

  test("database returns 1 blog after deleting one", async () => {
    try {
      await Blog.deleteOne({ author: "Michael Chan" });
      const db = await Blog.find({});
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.status, 200);
      assert.strictEqual(db.length, 1);
    } catch (error) {
      throw error;
    }
  });

  test("entries in database don't have _id or __v values", async () => {
    try {
      const response = await api.get("/api/blogs");
      for (const blog of response.body) {
        assert.strictEqual(response.status, 200);
        assert.strictEqual(blog.__v, undefined);
        assert.strictEqual(blog._id, undefined);
      }
      throw error;
    } catch (error) {}
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
});

describe("adding a new blog", () => {
  beforeEach(async () => {
    try {
      await mongoose.connect(config.MONGODB_STRING);
      await Blog.deleteMany({});
    } catch (error) {
      throw error;
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test("post operation increases the database length by 1", async () => {
    try {
      const blog = {
        title: "Road to internship",
        author: "Teppo Kolehmainen",
        url: "www.blogspot.com/roadtointernship",
        likes: 3,
      };
      const initialDB = await helper.blogsInDb();
      const request = await api.post("/api/blogs").send(blog);
      const afterPost = await helper.blogsInDb();

      assert.strictEqual(request.status, 201);
      assert.strictEqual(afterPost.length, initialDB.length + 1);
    } catch (error) {
      throw error;
    }
  });

  test("Blog object has default value 0 for likes if no value is given", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
      likes: null,
    };
    const request = await api.post("/api/blogs").send(blog);

    assert.strictEqual(request.status, 201);
    assert.strictEqual(request.body.likes, 0);
  });

  test("Blog object has default value 0 for likes key 'likes' is missing", async () => {
    const blog = {
      title: "Road to internship",
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
    };
    const request = await api.post("/api/blogs").send(blog);

    assert.strictEqual(request.status, 201);
    assert.strictEqual(request.body.likes, 0);
  });

  test("blog is not added if Blog object is missing key 'title'", async () => {
    const blog = {
      author: "Teppo Kolehmainen",
      url: "www.blogspot.com/roadtointernship",
      likes: 4,
    };
    const request = await api.post("/api/blogs").send(blog);
    assert.strictEqual(request.status, 400);
    assert.strictEqual(request.res.text, "Bad request");
  });

  test("blog is not added if Blog object is missing key 'url'", async () => {
    const blog = {
      author: "Teppo Kolehmainen",
      title: "Road to internship",
      likes: 4,
    };
    const request = await api.post("/api/blogs").send(blog);
    assert.strictEqual(request.status, 400);
    assert.strictEqual(request.res.text, "Bad request");
  });

  test("blog is not added if Blog object is missing key 'title' and 'url'", async () => {
    const blog = {
      author: "Teppo Kolehmainen",
      likes: 4,
    };
    const request = await api.post("/api/blogs").send(blog);
    assert.strictEqual(request.status, 400);
    assert.strictEqual(request.res.text, "Bad request");
  });
});

describe("deletion of a blog", () => {
  beforeEach(async () => {
    try {
      await mongoose.connect(config.MONGODB_STRING);
      await Blog.deleteMany({});
      await Blog.insertMany(helper.initialBlogs);
    } catch (error) {
      throw error;
    }
  });

  after(async () => {
    mongoose.connection.close();
  });

  test("server deletes one blog with id", async () => {
    const blogInDb = await helper.blogsInDb();
    const request = await api.delete(`/api/blogs/${blogInDb[0].id}`);
    // Database length changes after deletion
    const db = await helper.blogsInDb();

    assert.strictEqual(request.status, 204);
    assert.strictEqual(helper.initialBlogs.length - 1, db.length);
  });

  test("server returns status 404 with non-existing id", async () => {
    try {
      const request = await api.delete(`/api/blogs/${helper.nonExistingId}`);
      assert.strictEqual(request.status, 404);
    } catch (error) {
      throw error;
    }
  });
});
