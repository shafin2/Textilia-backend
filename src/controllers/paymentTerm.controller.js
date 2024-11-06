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

const getAllNewSupplyChainProposals = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({ message: "Invalid user ID." });
		}

		const paymentTerms = await PaymentTerm.find({
			$or: [{ userId: userId }, { supplier: userId }],
			$and: [{ general: false }],
		})
			.populate("supplier", "name _id")
			.populate("userId", "name _id");

		console.log("paymentTerms", paymentTerms);
		res.status(200).json(paymentTerms);
	} catch (error) {
		res.status(500).json({ message: "Error getting payment terms.", error });
	}
};

// Get General PaymentTerm
const getGeneralPaymentTerm = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({ message: "Invalid user ID." });
		}

		const generalTerms = await PaymentTerm.findOne({
			userId,
			general: true,
		});
		if (!generalTerms) {
			return res.status(200).json(null);
		}

		res.status(200).json(generalTerms);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error getting general payment Term.", error });
	}
};

// Create General PaymentTerm
const createGeneralPaymentTerm = async (req, res) => {
	try {
		const { userId, paymentMode, shipmentTerms, businessConditions, days } =
			req.body;

		const paymentTerm = new PaymentTerm({
			userId,
			general: true,
			paymentMode,
			shipmentTerms,
			businessConditions,
			days,
		});

		if (userId) {
			const existingProposal = await PaymentTerm.findOne({
				userId,
				general: true,
			});
			if (existingProposal) {
				return res
					.status(400)
					.json({ message: "General Proposal already exists." });
			}
		}

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
		const { paymentMode, shipmentTerms, businessConditions, days } = req.body;
		const { generalTermId } = req.params;

		console.log("generalTermId", generalTermId);

		if (
			generalTermId === "undefined" ||
			generalTermId === null ||
			!generalTermId ||
			!paymentMode ||
			!shipmentTerms ||
			!businessConditions ||
			!days
		) {
			return res.status(400).json({ message: "Invalid request." });
		}

		const generalTerm = await PaymentTerm.findById(generalTermId);
		if (!generalTerm) {
			return res.status(404).json({ message: "General Term not found." });
		}

		generalTerm.paymentMode = paymentMode;
		generalTerm.shipmentTerms = shipmentTerms;
		generalTerm.businessConditions = businessConditions;
		generalTerm.days = days;
		await generalTerm.save();

		res.status(200).json({
			message: "General Term updated successfully.",
			generalTerm,
		});
	} catch (error) {
		console.log("error", error);
		res.status(500).json({ message: "Error updating general Term.", error });
	}
};

// Create New PaymentTerm
const createNewPaymentTerm = async (req, res) => {
	try {
		const {
			userId,
			supplier,
			paymentMode,
			shipmentTerms,
			businessConditions,
			days,
			endDate,
		} = req.body;

		console.log("req.body", req.body);

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
			paymentMode,
			shipmentTerms,
			businessConditions,
			days,
			endDate,
			status: "proposal_sent_received",
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
			paymentMode,
			shipmentTerms,
			businessConditions,
			days,
		} = req.body;

		// Find the existing payment term
		const paymentTerm = await PaymentTerm.findById(paymentTermId);
		if (!paymentTerm) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		// Add the new revision to the revisions array
		paymentTerm.revisions.push({
			paymentMode: paymentTerm.paymentMode,
			shipmentTerms: paymentTerm.shipmentTerms,
			businessConditions: paymentTerm.businessConditions,
			status: paymentTerm.status,
			supplierShipmentTerms: paymentTerm.supplierShipmentTerms,
			supplierBusinessConditions: paymentTerm.supplierBusinessConditions,
			supplierEndDate: paymentTerm.supplierEndDate,
			days: paymentTerm.days,
			endDate: paymentTerm.endDate,
		});

		// Update the fields with new values
		paymentTerm.endDate = newEndDate;
		paymentTerm.paymentMode = paymentMode;
		paymentTerm.shipmentTerms = shipmentTerms;
		paymentTerm.businessConditions = businessConditions;
		paymentTerm.days = days;
		paymentTerm.status = "renew_requested_received"; // Status of the renewal

		// Save the updated payment term document
		await paymentTerm.save();

		// Send the response with the updated payment term
		res
			.status(200)
			.json({ message: "Payment Term renewed successfully.", paymentTerm });
	} catch (error) {
		// Handle errors
		res.status(500).json({ message: "Error renewing payment term.", error });
	}
};

const replyToPaymentTerm = async (req, res) => {
	try {
		const {
			proposalId,
			supplierId,
			customerId,
			supplierShipmentTerms,
			supplierBusinessConditions,
			supplierEndDate,
		} = req.body;

		console.log("req.body", req.body);

		// Validate required fields
		if (!proposalId || !supplierId || !customerId) {
			return res.status(400).json({ message: "Invalid request." });
		}

		// Check if customer exists
		const user = await User.findOne({
			_id: customerId,
			businessType: "client",
		});
		if (!user) {
			return res.status(400).json({ message: "Invalid User." });
		}

		// Check if supplier exists
		const supplier = await User.findOne({
			_id: supplierId,
			businessType: "supplier",
		});
		if (!supplier) {
			return res.status(400).json({ message: "Invalid Supplier." });
		}

		// Find the payment term
		const paymentTerm = await PaymentTerm.findOne({
			_id: proposalId,
			userId: customerId,
			supplier: supplierId,
		});

		if (!paymentTerm) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		// Update the payment term fields
		paymentTerm.supplierShipmentTerms = supplierShipmentTerms;
		paymentTerm.supplierBusinessConditions = supplierBusinessConditions;
		paymentTerm.supplierEndDate = supplierEndDate;
		paymentTerm.status = "proposal_replied";

		console.log("paymentTerm", paymentTerm);

		// Save the updated payment term
		await paymentTerm.save();

		res
			.status(200)
			.json({ message: "Payment Term replied successfully.", paymentTerm });
	} catch (error) {
		console.log("error", error);
		res.status(500).json({ message: "Error replying to payment Term.", error });
	}
};

// Accept Contract
const acceptContract = async (req, res) => {
	try {
		const { contractId, supplierId, customerId } = req.body;

		if (!contractId || !supplierId || !customerId) {
			return res.status(400).json({ message: "Invalid request." });
		}

		const user = await User.findOne({
			_id: customerId,
			businessType: "client",
		});
		if (!user) {
			return res.status(400).json({ message: "Invalid User." });
		}

		const supplier = await User.findOne({
			_id: supplierId,
			businessType: "supplier",
		});
		if (!supplier) {
			return res.status(400).json({ message: "Invalid Supplier." });
		}

		const contract = await PaymentTerm.findById(contractId);
		if (!contract) {
			return res.status(404).json({ message: "Payment Term not found." });
		}

		contract.status = "contracted";
		await contract.save();

		res
			.status(200)
			.json({ message: "Contract accepted successfully.", contract });
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
	getAllNewSupplyChainProposals,
	getGeneralPaymentTerm,
	createGeneralPaymentTerm,
	updateGeneralPaymentTerm,
	createNewPaymentTerm,
	renewPaymentTerm,
	replyToPaymentTerm,
	acceptContract,
};
