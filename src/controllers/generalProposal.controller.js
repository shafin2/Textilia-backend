const GeneralProposal = require("../models/generalProposal.model");
const GeneralInquiry = require("../models/generalInquiry.model");


exports.createGeneralProposals = async (req, res) => {
    const proposalsData = req.body.proposals; // Expect an array of proposal details

    if (!Array.isArray(proposalsData) || proposalsData.length === 0) {
        return res.status(400).json({ message: "No proposals provided" });
    }

    try {
        const createdProposals = [];
        for (const proposalData of proposalsData) {
            const { inquiryId, rate, quantity, deliveryStartDate, deliveryEndDate, paymentMode, shipmentTerms, businessCondition } = proposalData;

            const inquiry = await GeneralInquiry.findById(inquiryId);
            if (!inquiry) {
                throw new Error(`Inquiry not found for ID ${inquiryId}`);
            }

            // Create the proposal
            const proposal = new GeneralProposal({
                inquiryId,
                supplierId: req.user.id, // Assuming req.user.id is the authenticated supplier's ID
                customerId: inquiry.customerId,
                rate: proposalData.rate,
                quantity: proposalData.quantity,
                quantityType: proposalData.quantityType, 
                deliveryStartDate: proposalData.deliveryStartDate,
                deliveryEndDate: proposalData.deliveryEndDate,
                paymentMode: proposalData.paymentMode,
                paymentDays: proposalData.paymentDays, 
                shipmentTerms: proposalData.shipmentTerms,
                businessCondition: proposalData.businessCondition,
                status: "proposal_sent"
            });

            await proposal.save();
            createdProposals.push(proposal);

            // Update the inquiry status
            inquiry.status = "inquiry_replied"; 
            await inquiry.save();
        }

        res.status(201).json({ message: "Proposals created successfully", proposals: createdProposals });
    } catch (error) {
        res.status(500).json({ message: "Error creating proposals", error: error.message });
    }
};


exports.getCustomerProposals = async (req, res) => {
    try {
        const proposals = await GeneralProposal.find({ customerId: req.user._id })
            .populate('supplierId', 'name'); // Populate supplier details

        res.json(proposals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching proposals", error: error.message });
    }
};


exports.getSupplierProposals = async (req, res) => {
    try {
        const proposals = await GeneralProposal.find({ supplierId: req.user.id })
            .populate('inquiryId', 'details'); // Populate to get inquiry details for context

        res.json({ proposals });
    } catch (error) {
        res.status(500).json({ message: "Error fetching proposals", error: error.message });
    }
};

exports.acceptGeneralProposal = async (req, res) => {
    const { proposalId } = req.params;

    try {
        const proposal = await GeneralProposal.findById(proposalId);
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        const inquiry = await GeneralInquiry.findById(proposal.inquiryId);
        if (inquiry.customerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        proposal.status = "proposal_accepted";
        await proposal.save();

        res.status(200).json({ message: "Proposal accepted successfully", proposal });
    } catch (error) {
        res.status(500).json({ message: "Error accepting proposal", error: error.message });
    }
};