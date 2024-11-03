const PaymentTerm = require("../models/paymentTerm.model");
const User = require("../models/user.model");

// Get all PaymentTerms For debugging purposes
const getAllPaymentTerms = async (req, res) => {
	try {
		const paymentTerms = await PaymentTerm.find();
		res.status(200).json({ paymentTerms });
	} catch (error) {
		res.status(500).json({ message: "Error getting payment terms.", error });
	}
};

// Create General PaymentTerm
const createGeneralPaymentTerm = async (req, res) => {
	try {
		const { userId, mode, shipmentTerms, businessConditions, days } = req.body;

		const paymentTerm = new PaymentTerm({
			userId,
			general: true,
			mode,
			shipmentTerms,
			businessConditions,
			days,
		});

		await paymentTerm.save();
		res.status(201).json({
			message: "General payment Term created successfully.",
			paymentTerm,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error creating general payment Term.", error });
	}
};

// update the general PaymentTerm
const updateGeneralPaymentTerm = async (req, res) => {
	try {
		const { paymentTermId, mode, shipmentTerms, businessConditions, days } =
			req.body;

		const paymentTerm = await PaymentTerm.findById(paymentTermId);
		if (!paymentTerm) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		paymentTerm.mode = mode;
		paymentTerm.shipmentTerms = shipmentTerms;
		paymentTerm.businessConditions = businessConditions;
		paymentTerm.days = days;
		await paymentTerm.save();

		res.status(200).json({
			message: "General payment Term updated successfully.",
			paymentTerm,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error updating general payment Term.", error });
	}
};

// Create New PaymentTerm
const createNewPaymentTerm = async (req, res) => {
	try {
		const {
			userId,
			supplier,
			mode,
			shipmentTerms,
			businessConditions,
			days,
			endDate,
		} = req.body;

		if (supplier) {
			const user = await User.findById(supplier);
			if (!user || user.businessType !== "supplier") {
				return res.status(400).json({ message: "Invalid supplier." });
			}

			const existingProposal = await PaymentTerm.findOne({ userId, supplier });
			if (existingProposal) {
				return res
					.status(400)
					.json({ message: "Proposal already exists with this supplier." });
			}
		}

		const paymentTerm = new PaymentTerm({
			userId,
			supplier,
			mode,
			shipmentTerms,
			businessConditions,
			days,
			endDate,
		});

		await paymentTerm.save();
		res
			.status(201)
			.json({ message: "New payment term created successfully.", paymentTerm });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error creating new payment Term.", error });
	}
};

// Renew Payment Term
const renewPaymentTerm = async (req, res) => {
	try {
		const {
			paymentTermId,
			newEndDate,
			mode,
			shipmentTerms,
			businessConditions,
			days,
		} = req.body;

		const paymentTerm = await PaymentTerm.findById(paymentTermId);
		if (!paymentTerm) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		paymentTerm.endDate = newEndDate;
		paymentTerm.mode = mode;
		paymentTerm.shipmentTerms = shipmentTerms;
		paymentTerm.businessConditions = businessConditions;
		paymentTerm.days = days;
		paymentTerm.revision += 1;
		paymentTerm.status = "renew_requested_received";
		await paymentTerm.save();

		res
			.status(200)
			.json({ message: "Payment Term renewed successfully.", paymentTerm });
	} catch (error) {
		res.status(500).json({ message: "Error renewing payment Term.", error });
	}
};

// Reply to PaymentTerm
const replyToPaymentTerm = async (req, res) => {
	try {
		const {
			paymentTermId,
			supplierShipmentTerms,
			supplierBusinessConditions,
			supplierEndDate,
		} = req.body;

		const paymentTerm = await PaymentTerm.findById(paymentTermId);
		if (!paymentTerm) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		paymentTerm.supplierShipmentTerms = supplierShipmentTerms;
		paymentTerm.supplierBusinessConditions = supplierBusinessConditions;
		paymentTerm.supplierEndDate = supplierEndDate;
		paymentTerm.status = "payment_term_replied";
		await paymentTerm.save();

		res
			.status(200)
			.json({ message: "Payment Term replied successfully.", paymentTerm });
	} catch (error) {
		res.status(500).json({ message: "Error replying to payment Term.", error });
	}
};

// Accept Contract
const acceptContract = async (req, res) => {
	try {
		const { paymentTermId } = req.body;

		const paymentTerm = await PaymentTerm.findById(paymentTermId);
		if (!paymentTerm) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		paymentTerm.status = "contracted";
		await paymentTerm.save();

		res
			.status(200)
			.json({ message: "Contract accepted successfully.", paymentTerm });
	} catch (error) {
		res.status(500).json({ message: "Error accepting contract.", error });
	}
};

// Get all users
const getAllUsers = async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json({ users });
	} catch (error) {
		res.status(500).json({ message: "Error getting users.", error });
	}
};

// Exporting the controller functions
module.exports = {
	getAllUsers,
	getAllPaymentTerms,
	createGeneralPaymentTerm,
	updateGeneralPaymentTerm,
	createNewPaymentTerm,
	renewPaymentTerm,
	replyToPaymentTerm,
	acceptContract,
};
