"use strict";

var jwt = require("jsonwebtoken");

var fs = require("fs");

var asyncHandler = require("express-async-handler");

var mainPath = require("./baseFilepath");

var User = require('../model/userModel');

var bcrypt = require("bcryptjs");

var path = require("path");

var getAllUser = function getAllUser(req, res) {
  res.render("user/register", {
    pageTitle: "Register",
    path: "/register"
  });
}; //Register user
//@route Post/api/users/


var registerUser = asyncHandler(function _callee(req, res) {
  var _req$body, username, email, password;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, username = _req$body.username, email = _req$body.email, password = _req$body.password;
          username = username.trim();
          email = email.trim();
          password = password.trim();

          if (!(!username || !email || !password)) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            status: "FAILED",
            message: "Empty input Fields!"
          }));

        case 6:
          if (/^[a-zA-Z ]*$/.test(username)) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            status: "FAILED",
            message: "Invalid name entered"
          }));

        case 8:
          if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            status: "FAILED",
            message: "Invalid email entered"
          }));

        case 10:
          if (!(password.length < 8)) {
            _context.next = 12;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            status: "FAILED",
            message: "Password is too short!"
          }));

        case 12:
          _context.next = 14;
          return regeneratorRuntime.awrap(User.find({
            email: email
          }).then(function (result) {
            if (result.length) {
              //A user already exits
              return res.status(400).json({
                status: "FAILED",
                message: "User with the provided email already exists"
              });
            } //to create a new user
            //password handling


            var saltRounds = 10;
            bcrypt.hash(password, saltRounds).then(function (hashedPassword) {
              var newUser = new User({
                username: username,
                email: email,
                password: hashedPassword
              });
              newUser.save().then(function (result) {
                //handle account verification
                console.log("user  post is success");
                res.status(201).json(result); //  res.redirect("/register");
              })["catch"](function (err) {
                res.status(400).json({
                  status: "FAILED",
                  message: "An error occurred while saving user account!"
                });
              });
            })["catch"](function (err) {
              res.status(400).json({
                status: "FAILED",
                message: "An error occurred while hashing password!"
              });
            });
          })["catch"](function (err) {
            res.status(400).json({
              status: "FAILED",
              message: "An error occured while checking for existing user!"
            });
          }));

        case 14:
        case "end":
          return _context.stop();
      }
    }
  });
}); //@route Post/api/users/login

var loginUser = asyncHandler(function _callee2(req, res) {
  var _req$body2, email, password, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          email = email.trim();
          password = password.trim();

          if (!(email == "" || password == "")) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            status: "FAILED",
            message: "Empty credentials supplied"
          }));

        case 5:
          _context2.next = 7;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 7:
          user = _context2.sent;
          _context2.t0 = user;

          if (!_context2.t0) {
            _context2.next = 13;
            break;
          }

          _context2.next = 12;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 12:
          _context2.t0 = _context2.sent;

        case 13:
          if (!_context2.t0) {
            _context2.next = 17;
            break;
          }

          User.updateOne({
            _id: user.id
          }, {
            login: true
          }).then(function () {
            res.status(201).json({
              _id: user.id,
              username: user.username,
              email: user.email,
              login: true,
              token: generateToken(user._id)
            });
          })["catch"](function (err) {
            res.status(400).json({
              status: "FAILED",
              message: "An error occur while updating login data update"
            });
          });
          _context2.next = 18;
          break;

        case 17:
          res.status(400).json({
            status: "FAILED",
            message: "Email, Password is something wrong"
          });

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  });
});
/*Generate JWT */

var generateToken = function generateToken(id) {
  return jwt.sign({
    id: id
  }, "".concat(process.env.JWT_SECRET), {
    expiresIn: "30d"
  });
}; //update user information fucntion


var updateUser = asyncHandler(function _callee3(req, res) {
  var _req$body3, username, address, gender, id, updatedData;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body3 = req.body, username = _req$body3.username, address = _req$body3.address, gender = _req$body3.gender;
          id = req.user.id;
          /* Check for user */

          if (req.user) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            status: "FAILED",
            message: "user not found"
          }));

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(User.updateOne({
            _id: id
          }, {
            $set: {
              username: username,
              login: true,
              gender: gender,
              address: address
            }
          }));

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(User.findById(id));

        case 8:
          updatedData = _context3.sent;
          res.status(200).json({
            _id: id,
            username: updatedData.username,
            email: updatedData.email,
            address: updatedData.address,
            gender: updatedData.gender,
            profilePicture: updatedData.profilePicture,
            login: updatedData.login
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //update user profile img fucntion

var updateUserProfile = asyncHandler(function _callee4(req, res) {
  var profilePicture, id, userDetail, filesArray, file, updatedData;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          profilePicture = req.file; // console.log("profile picture",profilePicture)

          id = req.user.id;
          _context4.next = 4;
          return regeneratorRuntime.awrap(User.findById(id));

        case 4:
          userDetail = _context4.sent;

          if (req.user) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            status: "FAILED",
            message: "user not found"
          }));

        case 7:
          filesArray = [];

          if (!(profilePicture !== undefined && profilePicture !== [])) {
            _context4.next = 14;
            break;
          }

          file = {
            fileName: profilePicture.filename,
            filePath: profilePicture.path,
            fileType: profilePicture.mimetype,
            fileSize: fileSizeFormatter(profilePicture.size, 2)
          };
          filesArray.push(file);

          if (userDetail.profilePicture[0] !== "") {
            //for Image File to when when we do update picture
            fs.unlink(path.join(mainPath, userDetail.profilePicture[0].filePath), function (err) {
              if (err) {
                return console.log("error occur", err);
              }

              console.log("file is deleted successully");
            });
          } //update user


          _context4.next = 14;
          return regeneratorRuntime.awrap(User.updateOne({
            _id: id
          }, {
            $set: {
              profilePicture: filesArray
            }
          }));

        case 14:
          _context4.next = 16;
          return regeneratorRuntime.awrap(User.findById(id));

        case 16:
          updatedData = _context4.sent;
          res.status(200).json({
            _id: id,
            username: updatedData.username,
            email: updatedData.email,
            address: updatedData.address,
            gender: updatedData.gender,
            profilePicture: updatedData.profilePicture,
            login: updatedData.login
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  });
}); //for img file format

var fileSizeFormatter = function fileSizeFormatter(bytes, decimal) {
  if (bytes === 0) {
    return "0 byte";
  }

  var dm = decimal || 2;
  var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
  var index = Math.floor(Math.log(bytes) / Math.log(1000));
  return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + "-" + sizes[index];
}; // for all deletepost
//@route Delete/api/deletepost/:id


var deleteUserAccount = function deleteUserAccount(req, res) {
  var id, userDetail;
  return regeneratorRuntime.async(function deleteUserAccount$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // const id = req.params.id;
          id = req.user.id; // console.log("id is",id)

          _context5.next = 3;
          return regeneratorRuntime.awrap(User.findById(id));

        case 3:
          userDetail = _context5.sent;

          if (req.user) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            status: "FAILED",
            message: "user not found"
          }));

        case 6:
          userDetail.profilePicture[0] === '' || userDetail.profilePicture.length === 0 ? console.log("file is empty file") : fs.unlink(path.join(mainPath, userDetail.profilePicture[0].filePath), function (err) {
            // return fs.unlink(path.join(data.filePath), (err) => {
            if (err) {
              return console.log("error occur", err);
            }

            console.log("file is deleted successully");
          });
          _context5.next = 9;
          return regeneratorRuntime.awrap(User.findByIdAndRemove(id).exec());

        case 9:
          res.status(200).json("User Account Deleted Successfully"); // res.send();

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  });
};
/*get all user without token */


var getAlluser = function getAlluser(req, res, next) {
  var users;
  return regeneratorRuntime.async(function getAlluser$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.find());

        case 3:
          users = _context6.sent;
          res.status(200).send(users);
          _context6.next = 10;
          break;

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          res.status(400).send(_context6.t0.message);

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; //get user detial


var getUserDetail = asyncHandler(function _callee5(req, res) {
  var id, userdetail;
  return regeneratorRuntime.async(function _callee5$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          id = req.params.id;
          _context7.prev = 1;
          _context7.next = 4;
          return regeneratorRuntime.awrap(User.findById(id));

        case 4:
          userdetail = _context7.sent;
          res.status(200).send(userdetail);
          _context7.next = 11;
          break;

        case 8:
          _context7.prev = 8;
          _context7.t0 = _context7["catch"](1);
          res.status(400).send(_context7.t0.message);

        case 11:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[1, 8]]);
});
module.exports = {
  getAllUser: getAllUser,
  registerUser: registerUser,
  loginUser: loginUser,
  updateUser: updateUser,
  updateUserProfile: updateUserProfile,
  deleteUserAccount: deleteUserAccount,
  getAlluser: getAlluser,
  getUserDetail: getUserDetail
};
//# sourceMappingURL=userController.dev.js.map
