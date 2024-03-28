require("dotenv").config();

const PORT = process.env.PORT;
const MONGODB_STRING =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_STRING
    : process.env.MONGODB_STRING;

module.exports = {
  MONGODB_STRING,
  PORT,
};
