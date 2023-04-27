const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware")
const {profileImgs} = require("../middleware/uploadMiddleware")

const userInfo = require('../controller/userController')




// router.post("/login", loginUser);

router.get("/register", userInfo.getAllUser);

router.post("/register", userInfo.registerUser);

router.post("/login", userInfo.loginUser);

router.put("/profileupdate/:id",protect,profileImgs, userInfo.updateUserProfile);
router.put("/update/:id",protect, userInfo.updateUser);
router.delete("/delete/:id",protect, userInfo.deleteUserAccount);
// router.get("/detail/:id", getDetail);
// router.put("/update/:id", protect, uploadprofile, updateUser);


module.exports = router;
