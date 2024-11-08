const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../util/token");

// Update user profile and handle certificate uploads
exports.updateProfile = async (req, res) => {
	const { companyDetails, contactPersonInfo } = req.body;

	try {
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Update company details and contact person info
		if (companyDetails) {
			user.profile.companyDetails = {
				...user.profile.companyDetails,
				...JSON.parse(companyDetails), // Parse JSON data received in form
			};
		}

		if (contactPersonInfo) {
			const parsedContactPersonInfo = JSON.parse(contactPersonInfo);
			user.profile.contactPersonInfo = {
				...user.profile.contactPersonInfo,
				name: parsedContactPersonInfo.contactPersonName,
				email: parsedContactPersonInfo.contactPersonEmail,
				phoneNumber: parsedContactPersonInfo.contactPersonNumber,
				department: parsedContactPersonInfo.department,
				designation: parsedContactPersonInfo.designation,
			};
		}

		// Handle certificates upload (only for suppliers or agents)
		if (user.businessType === "supplier" || user.businessType === "agent") {
			if (req.body.certificateNames && req?.files?.length) {
				const certificateNames = JSON.parse(req.body.certificateNames); // Parse certificate names from JSON string
				const newCertificates = req.files.map((file, index) => ({
					name: certificateNames[index], // Match certificate name with the uploaded file
					filePath: file.path, // Store the file path
				}));

				// Update certificates
				user.certificates = [...user.certificates, ...newCertificates];
			}
		}

		await user.save();
		res.json({
			message: "Profile updated successfully",
			profile: user.profile,
			certificates: user.certificates,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error", error });
	}
};

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
			name: user.industryName,
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

		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
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
