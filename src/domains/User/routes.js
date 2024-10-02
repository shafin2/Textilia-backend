const express = require("express");
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const {
	signupUser,
	loginUser,
	logoutUser,
	updateProfile,
} = require("./controller");
const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.put(
	"/profile",
	protect(),
	upload.array("certificates", 4),
	updateProfile
);

module.exports = router;
