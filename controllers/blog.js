const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  try {
    const id = request.query.id;
    // Regex pattern checks that query is valid MongoDB object ID
    // if (id && !/^[0-9a-f-A-F]{24}$/) {
    //   return response.status(400).end("bad request")
    // }
    if (id) {
      const found = await Blog.findById(id);
      if (found) {
        return response.json(found);
      } else {
        return response.status(404).end("not found");
      }
    }
    const data = await Blog.find({});
    return response.json(data);
  } catch (error) {
    throw error;
  }
});

blogRouter.post("/", (request, response) => {
  const blog = new Blog(request.body);
  const keys = Object.keys(request.body);

  if (keys.includes("title") === false || keys.includes("url") === false) {
    return response.status(400).end("bad request");
  }
  blog.save().then((result) => {
    response.status(201).json(result);
  });
});

blogRouter.delete("/:id", async (request, response) => {
  try {
    const blogs = await Blog.find({});
    for (const blog of blogs) {
      if (blog.id === request.params.id) {
        await Blog.findByIdAndDelete(request.params.id);
        return response.status(204).end();
      }
    }
    return response.status(404).end("not found");
  } catch (error) {
    throw error;
  }
});

blogRouter.put("/:id", async (request, response) => {
  try {
    const blogs = await Blog.find({});
    for (const blog of blogs) {
      if (blog.id === request.params.id) {
        const updatedBlog = await Blog.findByIdAndUpdate(
          request.params.id,
          request.body,
          {
            new: true,
          }
        );
        return response.json(updatedBlog);
      }
    }
    return response.status(404).end("not found");
  } catch (error) {
    throw error;
  }
});

module.exports = blogRouter;
