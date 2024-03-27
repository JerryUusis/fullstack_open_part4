const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0;
  } else {
    const initialValue = 0;
    return blogs.reduce(
      (accumulator, currentValue) => accumulator + currentValue.likes,
      initialValue
    );
  }
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return [];
  }
  let highest = 0;

  for (const blog of blogs) {
    if (blog.likes > highest) {
      highest = blog.likes;
    }
  }
  const indexOfHighest = blogs.findIndex((item) => item.likes === highest);
  return blogs[indexOfHighest];
};

const blogs = [
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
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return [];
  }

  const authors = [];
  for (const blog of blogs) {
    // If authors array doesn't include object with a key-value pair author: <author name>, it returns -1
    const authorIndex = authors.findIndex(
      (author) => author.author === blog.author
    );
    // Create object if no aforementioned key value pair is found
    if (authorIndex === -1) {
      authors.push({ author: blog.author, blogs: 0 });
    }
  }
  // Compare how many times author name is found in the source array and increment blogs value on each match
  for (const author of authors) {
    for (const blog of blogs) {
      if (author.author === blog.author) {
        author.blogs++;
      }
    }
  }
  let mostBlogs = 0;
  for (const author of authors) {
    if (mostBlogs < author.blogs) {
      mostBlogs = author.blogs;
    }
  }
  const indexOfMostBlogs = authors.findIndex((author) => author.blogs === mostBlogs);
  return authors[indexOfMostBlogs];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
