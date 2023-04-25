"use strict";

var multer = require("multer");

var path = require("path"); // const DIR = "../client/public/images/";


var profileImg = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "ProfileImages");
  },
  filename: function filename(req, file, cb) {
    console.log("file are", file);
    cb(null, file.originalname + "-" + Date.now() + path.extname(file.originalname));
  }
}); // Check File Type

var filefilter = function filefilter(req, file, cb) {
  //Allow ext
  var filetypes = /jpeg|jpg|png|gif/; //Check ext

  var extname = filetypes.test(path.extname(file.originalname).toLocaleLowerCase()); //Check mime type

  var mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Image Only and Check File type!");
  }
};

var profileImgs = multer({
  storage: profileImg,
  limits: {
    fileSize: 5000000
  },
  fileFilter: filefilter
}).single("profilePicture");
module.exports = {
  profileImgs: profileImgs
};
//# sourceMappingURL=uploadMiddleware.dev.js.map
