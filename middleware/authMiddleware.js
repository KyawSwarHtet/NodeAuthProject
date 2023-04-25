const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      /* Get token from header */
      token = req.headers.authorization.split(" ")[1];

      /* Verify token */
      const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);

      /* Get user from the token */
      req.user = await User.findById(decoded.id).select("-password");
      if (req.user) {
        next();
      } else {
        res.status(403).json("You are not allow to do that!");
      }
    } catch (error) {
      console.log(error);
      res.status(401); //not autorized code
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(404);
    throw new Error("Not authorized, no token");
  }
});

// const verifyTokenAndAuthorization = (req, res, next) => {
//   protect(req, res, () => {
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//       next();
//     } else {
//       res.status(403).json("You are not allow to do that!");
//     }
//   });
// };

module.exports = { protect };
