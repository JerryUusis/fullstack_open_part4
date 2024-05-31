const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

blogRouter.get("/", async (request, response) => {
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
  const data = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  return response.json(data);
});

blogRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  });
  const keys = Object.keys(request.body);

  if (keys.includes("title") === false || keys.includes("url") === false) {
    return response.status(400).end("bad request");
  }

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
