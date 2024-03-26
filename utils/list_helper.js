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

module.exports = {
  dummy,
  totalLikes,
};
