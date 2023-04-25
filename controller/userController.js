const jwt = require("jsonwebtoken")
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const mainPath = require("./baseFilepath");
const User = require('../model/userModel')
const bcrypt = require("bcryptjs");
const path = require("path");


const getAllUser = (req,res) => {
    res.render("user/register", {
        pageTitle: "Register",
        path:"/register"
        
    })
}

//Register user
//@route Post/api/users/
const registerUser = asyncHandler(async (req, res) => {
  let { username, email, password} = req.body;

  username = username.trim();
  email = email.trim();
  password = password.trim();

  if (!username || !email || !password) {
    res.status(400).json({
      status: "FAILED",
      message: "Empty input Fields!",
    });
  } else if (!/^[a-zA-Z ]*$/.test(username)) {
    res.status(400).json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.status(400).json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (password.length < 8) {
    res.status(400).json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else {
    await User.find({ email })
      .then((result) => {
        if (result.length) {
          //A user already exits

          res.status(400).json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          //to create a new user

          //password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                username,
                email,
                password: hashedPassword,
              });
              newUser
                .save()
                .then((result) => {
                  //handle account verification
                  console.log("user  post is success");
                 
                  // res.status(201).json(result);
                   res.redirect("/register");
                 
                })
                .catch((err) => {
                  res.status(400).json({
                    status: "FAILED",
                    message: "An error occurred while saving user account!",
                  });
                });
            })
            .catch((err) => {
              res.status(400).json({
                status: "FAILED",
                message: "An error occurred while hashing password!",
              });
            });
        }
      })
      .catch((err) => {
        res.status(400).json({
          status: "FAILED",
          message: "An error occured while checking for existing user!",
        });
      });
  }
});

//@route Post/api/users/login
const loginUser = asyncHandler(async (req, res) => {
  let {  email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.status(400).json({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  } else {
    /* Check for user email*/
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password,user.password))) {
     
        User.updateOne({ _id: user.id }, { login: true })
          .then(() => {
            res.status(201).json({
              _id: user.id,
              username: user.username,
              email: user.email,             
              login: true,
              token: generateToken(user._id),
            });
          })
          .catch((err) => {
            res.status(400).json({
              status: "FAILED",
              message: "An error occur while updating login data update",
            });
          });
    } else {
      res.status(400).json({
        status: "FAILED",
        message: "Email, Password is something wrong",
      });
    }
  }
});

/*Generate JWT */
const generateToken = (id) => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: "30d",
  });
};

//update user fucntion
const updateUser = asyncHandler(async (req, res) => {
  const { username, email, address,gender  } = req.body;
  const profilePicture = req.file;

    const id = req.user.id;
  // console.log("profile picture is", profilePicture);
  // console.log("Id is",id);


  // console.log("user profile picture", profilePicture);
  const userDetail = await User.findById(id);
  /* Check for user */
  if (!req.user) {
    res.status(404);
    throw new Error("user not found");
  }

  let filesArray = [];
  if (profilePicture !== undefined && profilePicture !== []) {
    const file = {
      fileName: profilePicture.filename,
      filePath: profilePicture.path,
      fileType: profilePicture.mimetype,
      fileSize: fileSizeFormatter(profilePicture.size,2),
    };
    filesArray.push(file);
  }

  // console.log("user Detail profile", userDetail.profilePicture);

  //checking img and remove old img
  (profilePicture === [] || profilePicture === undefined) &&
  userDetail.profilePicture[0] !== ""
    ? userDetail.profilePicture.forEach((element) => {
        const file = {
          fileName: element.fileName,
          filePath: element.filePath,
          fileType: element.fileType,
          fileSize: element.fileSize,
        };
        filesArray.push(file);
      })
    : userDetail.profilePicture[0] === "" ||
      userDetail.profilePicture.length === 0
    ? console.log("new user is updated without new profile image")
    : userDetail.profilePicture.map(async (data, index) => {
        
        
      //for Image File to when when we do update picture
      return fs.unlink(path.join(mainPath, data.filePath), (err) => {
          if (err) {
            console.log("error occur", err);
          }
          return console.log("file is deleted successully");
        });
        
      });

  //update user
  await User.updateOne(
    { _id: id },
    {
      $set: {
        username: username,
        email: email,
        login: true,
        gender: gender,
        address: address,
        profilePicture: filesArray ? filesArray : [],
      },
    }
  );

  const updatedData = await User.findById(id);
  res.status(200).json({
    _id: id,
    username: updatedData.username,
    email: updatedData.email,
    address: updatedData.address,
    gender: updatedData.gender,
    profilePicture: updatedData.profilePicture,
    login: updatedData.login,
  });
  // console.log("request user token is", token);
  // console.log("updated data user result is", updatedData);
});

//for img file format
const fileSizeFormatter = (bytes, decimal) => {
  if (bytes === 0) {
    return "0 byte";
  }
  const dm = decimal || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1000));
  return (
    parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + "-" + sizes[index]
  );
};

// for all deletepost
//@route Delete/api/deletepost/:id
const deleteUserAccount = async (req, res) => {
  // const id = req.params.id;
  const id = req.user.id;
  // console.log("id is",id)
  const userDetail = await User.findById(id);
  // console.log("user detail id",userDetail)

  /* Check for user */
  if (!req.user) {
    res.status(401);
    throw new Error("user not found");
  }
    userDetail.profilePicture === []||userDetail.profilePicture[0] === '' || userDetail.profilePicture.length === 0
      ? console.log("file is empty file")
      : userDetail.profilePicture.map(async (data) => {
          
          return fs.unlink(path.join(mainPath, data.filePath), (err) => {
          // return fs.unlink(path.join(data.filePath), (err) => {
            if (err) {
              console.log("error occur", err);
            }

            return console.log("file is deleted successully");
          });
        });

  //if someone delete post , the favorite data also need to delete
  // await FavModel.deleteMany({ postId: id }).exec();

  await User.findByIdAndRemove(id).exec();
  res.status(200).json( "User Account Deleted Successfully");
  // res.send();
};




module.exports = {getAllUser,registerUser,loginUser,updateUser,deleteUserAccount}