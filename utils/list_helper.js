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
  let highest = 0;

  for (const blog of blogs) {
    if (blog.likes > highest) {
      highest = blog.likes;
    }
  }
  const indexOfHighest = blogs.findIndex((item) => item.likes === highest);
  return blogs[indexOfHighest]
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
