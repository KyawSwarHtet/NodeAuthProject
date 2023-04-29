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
  return  res.status(404).json({
      status: "FAILED",
      message: "Empty input Fields!",
    });
 
  }

  //checking user name
  if (!/^[a-zA-Z ]*$/.test(username)) {
   return res.status(400).json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  }

  //checking email
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
  return  res.status(400).json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  }
  //checking password length
  if (password.length < 8) {
   return res.status(400).json({
      status: "FAILED",
      message: "Password is too short!",
    });
  }
  
  //find user email from database
    await User.find({ email })
      .then((result) => {
        if (result.length) {
          //A user already exits
        return  res.status(400).json({
            status: "FAILED",
            message: "User with the provided email already exists",
          })

        } 
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
                 
                  res.status(201).json(result);
                  //  res.redirect("/register");
                 
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
        
      })
      .catch((err) => {
        res.status(400).json({
          status: "FAILED",
          message: "An error occured while checking for existing user!",
        });
      });
  
});

//@route Post/api/users/login
const loginUser = asyncHandler(async (req, res) => {
  let {  email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
   return res.status(400).json({
      status: "FAILED",
      message: "Empty credentials supplied",
    })
  }

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
  
});

/*Generate JWT */
const generateToken = (id) => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: "30d",
  });
};

//update user information fucntion
const updateUser = asyncHandler(async (req, res) => {
  const { username,address,gender  } = req.body;
    const id = req.user.id;

  /* Check for user */
  if (!req.user) {
    return res.status(404).json({
      status: "FAILED",
        message: "user not found",    
   })
  }
     //update user
  await User.updateOne(
    { _id: id },
    {
      $set: {
        username: username,
        login: true,
        gender: gender,
        address: address,
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
});

//update user profile img fucntion
const updateUserProfile = asyncHandler(async (req, res) => {
  const profilePicture = req.file;
  // console.log("profile picture",profilePicture)
    const id = req.user.id;
 
  const userDetail = await User.findById(id);

  /* Check for user */
  if (!req.user) {
    return res.status(404).json({
      status: "FAILED",
        message: "user not found",    
   })
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

    if (userDetail.profilePicture[0] !== "") {
         //for Image File to when when we do update picture
      fs.unlink(path.join(mainPath, userDetail.profilePicture[0].filePath), (err) => {
          if (err) {
          return  console.log("error occur", err);
          }
          console.log("file is deleted successully");
        });     
    }
    //update user
  await User.updateOne(
    { _id: id },
    {
      $set: {
        profilePicture: filesArray,
      },
    }
  );
  }
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
     return res.status(404).json({
      status: "FAILED",
        message: "user not found",    
   }) 
  }
  userDetail.profilePicture[0] === '' || userDetail.profilePicture.length === 0
      ? console.log("file is empty file")
      :       
       fs.unlink(path.join(mainPath, userDetail.profilePicture[0].filePath), (err) => {
          // return fs.unlink(path.join(data.filePath), (err) => {
            if (err) {
            return  console.log("error occur", err);
            }
             console.log("file is deleted successully");
          });

  await User.findByIdAndRemove(id).exec();
  res.status(200).json( "User Account Deleted Successfully");
  // res.send();
};

/*get all user without token */
const getAlluser = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//get user detial
const getUserDetail = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const userdetail = await User.findById(id);
    res.status(200).send(userdetail);
  } catch (error) {
    res.status(400).send(error.message);
  }
});



module.exports = {getAllUser,registerUser,loginUser,updateUser,updateUserProfile,deleteUserAccount,getAlluser,getUserDetail}