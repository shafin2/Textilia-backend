const mongoose = require("mongoose");

const blockBookingProposalSchema = new mongoose.Schema({
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "BlockBookingInquiry", required: true }, // Reference to the inquiry
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Supplier making the proposal

    // Supplier's proposed values
    countPrices: [{
        count: { type: Number, required: true },
        offeredPrice: { type: Number, required: true }
    }],
    materialCharges: [{
        material: { type: String, required: true },
        offeredUpcharge: { type: Number, required: true }
    }],
    certificateUpcharges: [{
        certificate: { type: String, required: true },
        offeredUpcharge: { type: Number, required: true }
    }],
    paymentTerms: {
        offeredPaymentMode: { type: String, enum: ["advance", "credit", "pdc", "advance_pdc", "lc"] },
        offeredDays: { type: Number },
        offeredShipmentTerms: { type: String },
        offeredBusinessConditions: { type: String, enum: ["efs", "gst", "non_gst"] },
    },

    // Proposal status
    status: { type: String, enum: ["proposal_sent", "proposal_accepted", "proposal_rejected", "inquiry_declined"], default: "proposal_sent" },
    aging: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

// Automatically update `updatedAt` field
blockBookingProposalSchema.pre("save", function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});

module.exports = mongoose.model("BlockBookingProposal", blockBookingProposalSchema);
