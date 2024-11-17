const mongoose = require("mongoose");

const generalProposalSchema = new mongoose.Schema({
    inquiryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GeneralInquiry",
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true },
    quantityType: {
        type: String,
        enum: ["kg", "lbs", "bags"],
        required: true
    },
    deliveryStartDate: { type: Date, required: true },
    deliveryEndDate: { type: Date, required: true },
    paymentMode: {
        type: String, 
        enum: ["advance", "credit", "pdc", "advance_pdc", "lc"],
    },
    paymentDays: { type: Number },
    shipmentTerms: { type: String, },
    businessCondition: { type: String,
        enum: ["efs", "gst", "non_gst"],
     },
    status: {
        type: String,
        enum: ["proposal_sent", "proposal_accepted", "completed"],
        default: "proposal_sent"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("GeneralProposal", generalProposalSchema);