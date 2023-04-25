"use strict";

var jwt = require("jsonwebtoken");

var asyncHandler = require("express-async-handler");

var User = require("../model/userModel");

var protect = asyncHandler(function _callee(req, res, next) {
  var token, decoded;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))) {
            _context.next = 15;
            break;
          }

          _context.prev = 1;

          /* Get token from header */
          token = req.headers.authorization.split(" ")[1];
          /* Verify token */

          decoded = jwt.verify(token, "".concat(process.env.JWT_SECRET));
          /* Get user from the token */

          _context.next = 6;
          return regeneratorRuntime.awrap(User.findById(decoded.id).select("-password"));

        case 6:
          req.user = _context.sent;

          if (req.user) {
            next();
          } else {
            res.status(403).json("You are not allow to do that!");
          }

          _context.next = 15;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](1);
          console.log(_context.t0);
          res.status(401); //not autorized code

          throw new Error("Not authorized");

        case 15:
          if (token) {
            _context.next = 18;
            break;
          }

          res.status(404);
          throw new Error("Not authorized, no token");

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // const verifyTokenAndAuthorization = (req, res, next) => {
//   protect(req, res, () => {
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//       next();
//     } else {
//       res.status(403).json("You are not allow to do that!");
//     }
//   });
// };

module.exports = {
  protect: protect
};
//# sourceMappingURL=authMiddleware.dev.js.map
