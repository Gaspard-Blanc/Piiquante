const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives, reéssayez dans 10 minutes",
});

module.exports = { limiter };
