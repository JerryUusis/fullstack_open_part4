const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const { userExtractor } = require("../utils/middleware");

blogRouter.get("/", async (request, response) => {
  const id = request.query.id;

  if (id) {
    const found = await Blog.findById(id);
    if (found) {
      return response.json(found);
    } else {
      return response.status(404).json({ error: "not found" });
    }
  }
  const data = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  return response.json(data);
});

// Post a new blog and link it to a specific user
blogRouter.post("/", userExtractor, async (request, response) => {
  // Get user with userExtractor middleware
  const user = request.user;

  const { title, author, url, likes } = request.body;

  const keys = Object.keys(request.body);

  // Check if title or URL is missing in the request body
  if (!keys.includes("title") || !keys.includes("url")) {
    return response.status(400).json({ error: "bad request" });
  }

  // Create a new blog object and link the user id to the user key in blog object
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  });

  // Store the blog to blogs collection and save the blog's id in the blogs array in users collection
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  return response.status(201).json(savedBlog);
});

blogRouter.delete("/:id", userExtractor, async (request, response) => {
  // Get user using userExtractor middleware
  const user = request.user;

  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: "not found" });
  } else if (blog.user.toString() === user.id) {
    await Blog.findByIdAndDelete(request.params.id);
    return response.status(200).json({ message: "blog deleted successfully" });
  }
});

blogRouter.put("/:id", async (request, response) => {
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
  return response.status(404).json({ error: "not found" });
});

module.exports = blogRouter;
