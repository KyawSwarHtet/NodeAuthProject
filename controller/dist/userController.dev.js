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
            _context.next = 8;
            break;
          }

          res.status(400).json({
            status: "FAILED",
            message: "Empty input Fields!"
          });
          _context.next = 22;
          break;

        case 8:
          if (/^[a-zA-Z ]*$/.test(username)) {
            _context.next = 12;
            break;
          }

          res.status(400).json({
            status: "FAILED",
            message: "Invalid name entered"
          });
          _context.next = 22;
          break;

        case 12:
          if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            _context.next = 16;
            break;
          }

          res.status(400).json({
            status: "FAILED",
            message: "Invalid email entered"
          });
          _context.next = 22;
          break;

        case 16:
          if (!(password.length < 8)) {
            _context.next = 20;
            break;
          }

          res.status(400).json({
            status: "FAILED",
            message: "Password is too short!"
          });
          _context.next = 22;
          break;

        case 20:
          _context.next = 22;
          return regeneratorRuntime.awrap(User.find({
            email: email
          }).then(function (result) {
            if (result.length) {
              //A user already exits
              res.status(400).json({
                status: "FAILED",
                message: "User with the provided email already exists"
              });
            } else {
              //to create a new user
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
                  console.log("user  post is success"); // res.status(201).json(result);

                  res.redirect("/register");
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
            }
          })["catch"](function (err) {
            res.status(400).json({
              status: "FAILED",
              message: "An error occured while checking for existing user!"
            });
          }));

        case 22:
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
            _context2.next = 7;
            break;
          }

          res.status(400).json({
            status: "FAILED",
            message: "Empty credentials supplied"
          });
          _context2.next = 20;
          break;

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 9:
          user = _context2.sent;
          _context2.t0 = user;

          if (!_context2.t0) {
            _context2.next = 15;
            break;
          }

          _context2.next = 14;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 14:
          _context2.t0 = _context2.sent;

        case 15:
          if (!_context2.t0) {
            _context2.next = 19;
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
          _context2.next = 20;
          break;

        case 19:
          res.status(400).json({
            status: "FAILED",
            message: "Email, Password is something wrong"
          });

        case 20:
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
}; //update user fucntion


var updateUser = asyncHandler(function _callee4(req, res) {
  var _req$body3, username, email, address, gender, profilePicture, id, userDetail, filesArray, file, updatedData;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body3 = req.body, username = _req$body3.username, email = _req$body3.email, address = _req$body3.address, gender = _req$body3.gender;
          profilePicture = req.file;
          id = req.user.id; // console.log("profile picture is", profilePicture);
          // console.log("Id is",id);
          // console.log("user profile picture", profilePicture);

          _context4.next = 5;
          return regeneratorRuntime.awrap(User.findById(id));

        case 5:
          userDetail = _context4.sent;

          if (req.user) {
            _context4.next = 9;
            break;
          }

          res.status(404);
          throw new Error("user not found");

        case 9:
          filesArray = [];

          if (profilePicture !== undefined && profilePicture !== []) {
            file = {
              fileName: profilePicture.filename,
              filePath: profilePicture.path,
              fileType: profilePicture.mimetype,
              fileSize: fileSizeFormatter(profilePicture.size, 2)
            };
            filesArray.push(file);
          } // console.log("user Detail profile", userDetail.profilePicture);
          //checking img and remove old img


          (profilePicture === [] || profilePicture === undefined) && userDetail.profilePicture[0] !== "" ? userDetail.profilePicture.forEach(function (element) {
            var file = {
              fileName: element.fileName,
              filePath: element.filePath,
              fileType: element.fileType,
              fileSize: element.fileSize
            };
            filesArray.push(file);
          }) : userDetail.profilePicture[0] === "" || userDetail.profilePicture.length === 0 ? console.log("new user is updated without new profile image") : userDetail.profilePicture.map(function _callee3(data, index) {
            return regeneratorRuntime.async(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt("return", fs.unlink(path.join(mainPath, data.filePath), function (err) {
                      if (err) {
                        console.log("error occur", err);
                      }

                      return console.log("file is deleted successully");
                    }));

                  case 1:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          }); //update user

          _context4.next = 14;
          return regeneratorRuntime.awrap(User.updateOne({
            _id: id
          }, {
            $set: {
              username: username,
              email: email,
              login: true,
              gender: gender,
              address: address,
              profilePicture: filesArray ? filesArray : []
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
          }); // console.log("request user token is", token);
          // console.log("updated data user result is", updatedData);

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
  return regeneratorRuntime.async(function deleteUserAccount$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // const id = req.params.id;
          id = req.user.id; // console.log("id is",id)

          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findById(id));

        case 3:
          userDetail = _context6.sent;

          if (req.user) {
            _context6.next = 7;
            break;
          }

          res.status(401);
          throw new Error("user not found");

        case 7:
          userDetail.profilePicture === [] || userDetail.profilePicture[0] === '' || userDetail.profilePicture.length === 0 ? console.log("file is empty file") : userDetail.profilePicture.map(function _callee5(data) {
            return regeneratorRuntime.async(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    return _context5.abrupt("return", fs.unlink(path.join(mainPath, data.filePath), function (err) {
                      // return fs.unlink(path.join(data.filePath), (err) => {
                      if (err) {
                        console.log("error occur", err);
                      }

                      return console.log("file is deleted successully");
                    }));

                  case 1:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          }); //if someone delete post , the favorite data also need to delete
          // await FavModel.deleteMany({ postId: id }).exec();

          _context6.next = 10;
          return regeneratorRuntime.awrap(User.findByIdAndRemove(id).exec());

        case 10:
          res.status(200).json("User Account Deleted Successfully"); // res.send();

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  });
};

module.exports = {
  getAllUser: getAllUser,
  registerUser: registerUser,
  loginUser: loginUser,
  updateUser: updateUser,
  deleteUserAccount: deleteUserAccount
};
//# sourceMappingURL=userController.dev.js.map
