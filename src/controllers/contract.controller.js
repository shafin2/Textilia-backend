const Contract = require("../models/contract.model");

// Function to send (create) a new contract
const sendContract = async (req, res) => {
	try {
		const {
			contractNumber,
			contractDate,
			contractType,
			supplierId,
			clientId,
			description,
			// terms,
		} = req.body;

		if (contractType === "block-booking" && !req.body.allocationNumber) {
			return res.status(400).json({
				message: "Allocation number is required for block-booking contracts",
			});
		}

		const contract = new Contract({
			contractNumber,
			contractDate,
			contractType,
			supplierId,
			clientId,
			description,
			// terms,
			contractStatus: "contract_sent_rcvd",
			...(contractType === "block-booking" && {
				allocationNumber: req.body.allocationNumber,
			}),
		});

		await contract.save();
		res
			.status(201)
			.json({ message: "Contract created successfully", contract });
	} catch (error) {
		res
			.status(400)
			.json({ message: "Failed to create contract", error: error.message });
	}
};

// Function to get a contract by its ID
const getContractById = async (req, res) => {
	try {
		const { id } = req.params;
		const contract = await Contract.findById(id)
			.populate("supplierId clientId description")
			.exec();

		if (!contract) {
			return res.status(404).json({ message: "Contract not found" });
		}
		res.status(200).json(contract);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving contract", error: error.message });
	}
};

const getAllUserContracts = async (req, res) => {
	try {
		const { userId } = req.params;

		// Fetch contracts whose contratType is not equal to contract_send_rcvd and populate `supplierId`, `clientId`, and `description`
		const contracts = await Contract.find({
			contractStatus: { $ne: "contract_sent_rcvd" },
			$or: [{ supplierId: userId }, { clientId: userId }],
		})
			.populate("supplierId clientId") // Populate supplier and client details
			.populate({
				path: "description",
				populate: "inquiryId",
			})
			.exec();

		// Modify the contracts to include `inquiryId` in the description objects
		const updatedContracts = contracts.map((contract) => {
			const updatedDescriptions = contract.description.map((desc) => ({
				...desc.toObject(), // Convert Mongoose sub-document to plain object
				inquiryId: desc.inquiryId, // Ensure `inquiryId` is explicitly included
			}));

			return {
				...contract.toObject(), // Convert Mongoose document to plain object
				description: updatedDescriptions,
			};
		});

		console.log("Updated Contracts: ", updatedContracts);

		res.status(200).json(updatedContracts);
	} catch (error) {
		console.error("Error retrieving user contracts:", error.message);
		res.status(500).json({
			message: "Error retrieving user contracts",
			error: error.message,
		});
	}
};

// Function to get all running contracts
const getAllRunningUserContracts = async (req, res) => {
	try {
		const { userId } = req.params;
		const contracts = await Contract.find({
			contractStatus: "running",
			$or: [{ supplierId: userId }, { clientId: userId }],
		})
			.populate("supplierId clientId description")
			.exec();

		res.status(200).json(contracts);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving running contracts",
			error: error.message,
		});
	}
};

// Function to get all new contracts (status: proposal_rcvd, reply_awaited, under_negotiation)
const getAllNewUserContracts = async (req, res) => {
	try {
		const { userId } = req.params;

		// Fetch contracts whose contratType is not equal to contract_send_rcvd and populate `supplierId`, `clientId`, and `description`
		const contracts = await Contract.find({
			contractStatus: {
				$in: ["contract_sent_rcvd"],
			},
			contractType: "general",
			$or: [{ supplierId: userId }, { clientId: userId }],
		})
			.populate("supplierId clientId", "name") // Populate supplier and client details
			.populate({
				path: "description",
				populate: "inquiryId",
			})
			.exec();

		// Modify the contracts to include `inquiryId` in the description objects
		const updatedContracts = contracts.map((contract) => {
			const updatedDescriptions = contract.description.map((desc) => ({
				...desc.toObject(), // Convert Mongoose sub-document to plain object
				inquiryId: desc.inquiryId, // Ensure `inquiryId` is explicitly included
			}));

			return {
				...contract.toObject(), // Convert Mongoose document to plain object
				description: updatedDescriptions,
			};
		});

		console.log("Updated Contracts: ", updatedContracts);

		res.status(200).json(contracts);
	} catch (error) {
		console.error("Error retrieving user contracts:", error.message);
		res.status(500).json({
			message: "Error retrieving user contracts",
			error: error.message,
		});
	}
};

// Function to get all block booking contracts
const getAllBlockBookingUserContracts = async (req, res) => {
	try {
		const { userId } = req.params;
		const contracts = await Contract.find({
			contractStatus: {
				$in: ["contract_sent_rcvd"],
			},
			contractType: "block-booking",
			$or: [{ supplierId: userId }, { clientId: userId }],
		})
			.populate("supplierId clientId")
			.exec();

		res.status(200).json(contracts);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving block-booking contracts",
			error: error.message,
		});
	}
};

// Function to get all completed contracts (status: dlvrd, closed)
const getAllCompletedUserContracts = async (req, res) => {
	try {
		const contracts = await Contract.find({
			contractStatus: { $in: ["dlvrd", "closed"] },
			or: [{ supplierId: userId }, { clientId: userId }],
		})
			.populate("supplierId clientId")
			.exec();

		res.status(200).json(contracts);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving completed contracts",
			error: error.message,
		});
	}
};

// Function to get all contracts (For debugging purposes)
const getAllContracts = async (req, res) => {
	try {
		const contracts = await Contract.find()
			.populate("supplierId clientId")
			.exec();
		res.status(200).json(contracts);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving contracts", error: error.message });
	}
};

// Function to accept a contract (e.g., change its status to "confirmed")
const acceptContract = async (req, res) => {
	try {
		const { id } = req.params;
		const { clientId, supplierId } = req.body;

		console.log("Request Body: ", req.body);

		const contract = await Contract.findById(id);

		if (contract.contractType === "block-booking") {
			// Check if the client and supplier are the same as the contract's client and supplier
			if (
				clientId !== contract.clientId.toString() ||
				supplierId !== contract.supplierId.toString()
			) {
				return res.status(400).json({ message: "Invalid client or supplier" });
			}
		}

		contract.contractStatus = "running";

		await contract.save();

		if (!contract) {
			return res.status(404).json({ message: "Contract not found" });
		}
		res
			.status(200)
			.json({ message: "Contract accepted successfully", contract });
	} catch (error) {
		res
			.status(400)
			.json({ message: "Error accepting contract", error: error.message });
	}
};

// Function to upload an SO Document
const uploadSODocument = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, path } = req.body;

		const contract = await Contract.findByIdAndUpdate(
			id,
			{ soDocument: { name, path } },
			{ new: true }
		);

		if (!contract) {
			return res.status(404).json({ message: "Contract not found" });
		}
		res
			.status(200)
			.json({ message: "SO Document uploaded successfully", contract });
	} catch (error) {
		res
			.status(400)
			.json({ message: "Error uploading SO Document", error: error.message });
	}
};

module.exports = {
	sendContract,
	getContractById,
	getAllUserContracts,
	getAllContracts,
	acceptContract,
	uploadSODocument,
	getAllRunningUserContracts,
	getAllNewUserContracts,
	getAllBlockBookingUserContracts,
	getAllCompletedUserContracts,
};
