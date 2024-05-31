const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogRouter.get("/", async (request, response) => {
  const id = request.query.id;

  if (id) {
    const found = await Blog.findById(id);
    if (found) {
      return response.json(found);
    } else {
      return response.status(404).end("not found");
    }
  }
  const data = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  return response.json(data);
});

// Post a new blog and link it to a specific user
blogRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const keys = Object.keys(request.body);

  // Check if title or URL is missing in the request
  if (!keys.includes("title") || !keys.includes("url")) {
    return response.status(400).end("bad request");
  }

  // Check if token (extracted from request's Authorization header by tokenExtractor middleware) exists
  if (!request.token) {
    return response.status(401).json({ error: "token missing" });
  }
  // Decrypt the token
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  // Use id to find the matching user from users collection
  const user = await User.findById(decodedToken.id);

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

blogRouter.delete("/:id", async (request, response) => {
  const blogs = await Blog.find({});
  for (const blog of blogs) {
    if (blog.id === request.params.id) {
      await Blog.findByIdAndDelete(request.params.id);
      return response.status(204).end();
    }
  }
  return response.status(404).end("not found");
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
  return response.status(404).end("not found");
});

module.exports = blogRouter;
