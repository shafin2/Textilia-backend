const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../util/token");

// Signup
exports.signupUser = async (req, res) => {
	const { industryName, email, confirmPassword, password, businessType } =
		req.body;

	try {
		if (password !== confirmPassword)
			return res.status(400).json({ message: "Passwords do not match" });

		const userExists = await User.findOne({ email });
		if (userExists)
			return res.status(400).json({ message: "User already exists" });

		const user = await User.create({
			name: industryName,
			email,
			password,
			businessType,
		});
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			businessType: user.businessType,
			token: generateToken(user),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Login
exports.loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user)
			return res.status(404).json({ message: "Invalid email or password" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid email or password" });

		console.log("User: ", user);

		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			profile: user.profile.companyDetails,
			businessType: user.businessType,
			token: generateToken(user),
		});
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

exports.logoutUser = async (req, res) => {
	try {
		res
			.status(200)
			.cookie("token", null, {
				expires: new Date(Date.now()),
				httpOnly: true,
				secure: true,
				sameSite: "none",
			})
			.json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};
