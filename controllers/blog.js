const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
    console.log("Received a get request");
  });
});

blogRouter.post("/", (request, response) => {
  const blog = new Blog(request.body);
  const keys = Object.keys(request.body);

  if (keys.includes("title") === false || keys.includes("url") === false) {
    return response.status(400).end("Bad request");
  }
  blog.save().then((result) => {
    response.status(201).json(result);
    console.log("Succesfully posted:", blog.title);
  });
});

module.exports = blogRouter;
