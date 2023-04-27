"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../middleware/authMiddleware"),
    protect = _require.protect;

var _require2 = require("../middleware/uploadMiddleware"),
    profileImgs = _require2.profileImgs;

var userInfo = require('../controller/userController'); // router.post("/login", loginUser);


router.get("/register", userInfo.getAllUser);
router.post("/register", userInfo.registerUser);
router.post("/login", userInfo.loginUser);
router.put("/profileupdate/:id", protect, profileImgs, userInfo.updateUserProfile);
router.put("/update/:id", protect, userInfo.updateUser);
router["delete"]("/delete/:id", protect, userInfo.deleteUserAccount); // router.get("/detail/:id", getDetail);
// router.put("/update/:id", protect, uploadprofile, updateUser);

module.exports = router;
//# sourceMappingURL=user-route.dev.js.map
