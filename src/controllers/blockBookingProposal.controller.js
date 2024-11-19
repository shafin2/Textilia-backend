const BlockBookingProposal = require("../models/blockBookingProposal.model");
const BlockBookingInquiry = require("../models/blockBookingInquiry.model");

exports.createProposal = async (req, res) => {
    try {
        const { inquiryId, countPrices, materialCharges, certificateUpcharges, paymentTerms } = req.body;

        // Ensure the inquiry exists
        const inquiry = await BlockBookingInquiry.findById(inquiryId);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found." });
        }
        // Check if a proposal already exists for this supplier and inquiry
        const existingProposal = await BlockBookingProposal.findOne({
            inquiryId,
            supplierId: req.user.id,
        });

        if (existingProposal) {
            // Update the existing proposal
            existingProposal.countPrices = countPrices || existingProposal.countPrices;
            existingProposal.materialCharges = materialCharges || existingProposal.materialCharges;
            existingProposal.certificateUpcharges = certificateUpcharges || existingProposal.certificateUpcharges;
            existingProposal.paymentTerms = paymentTerms || existingProposal.paymentTerms;

            const updatedProposal = await existingProposal.save();
            return res.status(201).json({ 
                message: "Proposal updated successfully.", 
                proposal: updatedProposal 
            });
        }

        // Create a new proposal if no existing proposal found
        const proposal = new BlockBookingProposal({
            inquiryId,
            supplierId: req.user.id,
            countPrices,
            materialCharges,
            certificateUpcharges,
            paymentTerms,
        });

        const savedProposal = await proposal.save();

        // Update the status of the inquiry
        inquiry.status = "inquiry_replied";
        await inquiry.save();
        res.status(201).json({ message: "Proposal created successfully.", proposal: savedProposal });
    } catch (error) {
        console.error("Error creating proposal:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerProposals = async (req, res) => {
    try {
        const customerId = req.user.id;

        // Fetch inquiries made by the customer
        const inquiries = await BlockBookingInquiry.find({ customerId }).select("_id baseCount targetBasePrice createdAt status aging");

        // Fetch all proposals related to those inquiries
        const proposals = await BlockBookingProposal.find({ inquiryId: { $in: inquiries.map((inquiry) => inquiry._id) } })
            .select("inquiryId supplierId createdAt status aging")
            .populate("inquiryId", "baseCount targetBasePrice createdAt status aging")
            .populate("supplierId", "name email")

        res.status(200).json(proposals);
    } catch (error) {
        console.error("Error fetching customer proposals:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getSupplierProposals = async (req, res) => {
    try {
        const supplierId = req.user.id;

        // Fetch proposals created by the supplier
        const proposals = await BlockBookingProposal.find({ supplierId })
            .select("inquiryId createdAt status aging")
            .populate("inquiryId", "baseCount targetBasePrice createdAt status aging");

        res.status(200).json(proposals);
    } catch (error) {
        console.error("Error fetching supplier proposals:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getProposalDetails = async (req, res) => {
    try {
        const { inquiryId } = req.params;
        // Fetch the proposal
        const proposal = await BlockBookingProposal.findOne({ inquiryId })

        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found." });
        }

        // Check if inquiryId is populated correctly
        if (!proposal.inquiryId) {
            return res.status(400).json({ message: "Inquiry details missing in proposal." });
        }

        // Combine inquiry and proposal details
        const response = {
            proposalDetails: proposal,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching proposal details:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getInquiryProposals = async (req, res) => {
    try {
        const { inquiryId } = req.params;

        // Fetch the inquiry
        const inquiry = await BlockBookingInquiry.findById(inquiryId).select("-customerId -__v");
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found." });
        }

        // Fetch all proposals for the given inquiry
        const proposals = await BlockBookingProposal.find({ inquiryId }).populate("supplierId", "name email -_id");

        if (!proposals || proposals.length === 0) {
            return res.status(404).json({ message: "No proposals found for this inquiry." });
        }

        // Combine inquiry and all proposals
        const response = {
            inquiryDetails: inquiry,
            proposals: proposals,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching inquiry proposals:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.acceptProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;

        // Fetch the proposal
        const proposal = await BlockBookingProposal.findById(proposalId);
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found." });
        }

        // Update the status of the proposal
        proposal.status = "proposal_accepted";
        const updatedProposal = await proposal.save();

        res.status(201).json({ message: "Proposal accepted successfully.", proposal: updatedProposal });
    } catch (error) {
        console.error("Error accepting proposal:", error.message);
        res.status(500).json({ error: error.message });
    }
};