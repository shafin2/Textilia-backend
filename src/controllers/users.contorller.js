const User = require("../models/user.model");

// Get Suppliers
const getSuppliers = async (req, res) => {
	try {
		const suppliers = await User.find({ businessType: "supplier" }).select(
			"name _id"
		);

		if (!suppliers || suppliers.length === 0) {
			return res.status(404).json({ message: "No suppliers found." });
		}

		res.json(suppliers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error", error });
	}
};

// Update user profile and handle certificate uploads
const updateProfile = async (req, res) => {
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

module.exports = {
	getSuppliers,
	updateProfile,
};
