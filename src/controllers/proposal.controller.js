const Proposal = require("../models/proposal.model");
const User = require("../models/user.model"); // Assuming you have a User model

// Create General Proposal
const createGeneralProposal = async (req, res) => {
	try {
		const { userId, mode, shipmentTerms, businessConditions, days } = req.body;

		const proposal = new Proposal({
			userId,
			general: true,
			mode,
			shipmentTerms,
			businessConditions,
			days,
		});

		await proposal.save();
		res
			.status(201)
			.json({ message: "General proposal created successfully.", proposal });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error creating general proposal.", error });
	}
};

// update the general Proposal
const updateGeneralProposal = async (req, res) => {
	try {
		const { proposalId, mode, shipmentTerms, businessConditions, days } =
			req.body;

		const proposal = await Proposal.findById(proposalId);
		if (!proposal) {
			return res.status(404).json({ message: "Proposal not found." });
		}

		proposal.mode = mode;
		proposal.shipmentTerms = shipmentTerms;
		proposal.businessConditions = businessConditions;
		proposal.days = days;
		await proposal.save();

		res
			.status(200)
			.json({ message: "General proposal updated successfully.", proposal });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error updating general proposal.", error });
	}
};

// Create New Proposal
const createNewProposal = async (req, res) => {
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

		const proposal = new Proposal({
			userId,
			supplier,
			mode,
			shipmentTerms,
			businessConditions,
			days,
			endDate,
		});

		await proposal.save();
		res
			.status(201)
			.json({ message: "New proposal created successfully.", proposal });
	} catch (error) {
		res.status(500).json({ message: "Error creating new proposal.", error });
	}
};

// Renew Proposal
const renewProposal = async (req, res) => {
	try {
		const { proposalId, newEndDate } = req.body;

		const proposal = await Proposal.findById(proposalId);
		if (!proposal) {
			return res.status(404).json({ message: "Proposal not found." });
		}

		proposal.endDate = newEndDate;
		proposal.revision += 1;
		proposal.status = "renew_requested_received";
		await proposal.save();

		res
			.status(200)
			.json({ message: "Proposal renewed successfully.", proposal });
	} catch (error) {
		res.status(500).json({ message: "Error renewing proposal.", error });
	}
};

// Reply to Proposal
const replyToProposal = async (req, res) => {
	try {
		const {
			proposalId,
			supplierShipmentTerms,
			supplierBusinessConditions,
			supplierEndDate,
		} = req.body;

		const proposal = await Proposal.findById(proposalId);
		if (!proposal) {
			return res.status(404).json({ message: "Proposal not found." });
		}

		proposal.supplierShipmentTerms = supplierShipmentTerms;
		proposal.supplierBusinessConditions = supplierBusinessConditions;
		proposal.supplierEndDate = supplierEndDate;
		proposal.status = "proposal_replied";
		await proposal.save();

		res
			.status(200)
			.json({ message: "Proposal replied successfully.", proposal });
	} catch (error) {
		res.status(500).json({ message: "Error replying to proposal.", error });
	}
};

// Accept Contract
const acceptContract = async (req, res) => {
	try {
		const { proposalId } = req.body;

		const proposal = await Proposal.findById(proposalId);
		if (!proposal) {
			return res.status(404).json({ message: "Proposal not found." });
		}

		proposal.status = "contracted";
		await proposal.save();

		res
			.status(200)
			.json({ message: "Contract accepted successfully.", proposal });
	} catch (error) {
		res.status(500).json({ message: "Error accepting contract.", error });
	}
};

// Exporting the controller functions
module.exports = {
	createGeneralProposal,
	updateGeneralProposal,
	createNewProposal,
	renewProposal,
	replyToProposal,
	acceptContract,
};
