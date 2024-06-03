const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    const error = new Error("Not authorized");
    error.statusCode = 401;
    throw error;
  }
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, "supersecretkey");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodeToken) {
    const error = new Error("Not authorized");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodeToken.userId;
  next();
};
