const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

// works in a similar way to a setter
blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    if (returnedObject.likes === null) {
      returnedObject.likes = 0;
    }
    if (!Object.keys(returnedObject).includes("likes")) {
      returnedObject.likes = 0;
    }
  },
});

module.exports = mongoose.model("Blog", blogSchema);
