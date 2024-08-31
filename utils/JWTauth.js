const jwt = require("jsonwebtoken");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "key";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const allField = [
    "General Setting",
    "Slider",
    "Academic Master",
    "Course Master",
    "Footer",
    "FontAwesome",
    "Gallery",
    "Menu Master",
    "Testimonial",
    "Page View Master",
    "Client",
    "Plan and Prices Master",
    "Result",
    "Download",
    "TC Issued",
    "Contact",
    "HP BodyCard",
    "HP Content Master",
    "Video Master",
    "Event",
  ]

  if (authHeader) {
    const token = authHeader.split(" ")[1];


    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      console.log(user)
      req.user = user;

      // Assuming `CompanyCode` is a claim in the token
      req.companyCode = user.compCode;

      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = authenticateJWT;
