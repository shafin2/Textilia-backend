const mongoose = require("mongoose");

const blockBookingInquirySchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    baseSpecs: { 
        carded: { type: Boolean, default: false },
        combed: { type: Boolean, default: false },
        compact: { type: Boolean, default: false },
        plain: { type: Boolean, default: false },
        slub: { type: Boolean, default: false },
        lycra: { type: Boolean, default: false }
    },
    baseCount: { type: Number, min: 6, max: 120, required: true },
    slubUpcharge: { type: Number, required: true },
    targetBasePrice: { type: Number, required: true },
    upperCount: { type: Number, min: 6, max: 120, required: true },
    lowerCount: { type: Number, min: 6, max: 120, required: true },
    countPrices: [{
        count: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    paymentTerms: {
        paymentMode: { type: String, enum: ["advance", "credit", "pdc", "advance_pdc", "lc"], required: true },
        days: { type: Number, required: true },
        shipmentTerms: { type: String, required: true },
        businessConditions: { 
            type: String, 
            enum: ["efs", "gst", "non_gst"], 
            required: true 
        }
    },
    materialCharges: [{
        material: { type: String, required: true },
        upcharge: { type: Number, required: true }
    }],
    certificateUpcharges: [{
        certificate: { type: String, required: true },
        upcharge: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["inquiry_sent", "inquiry_replied"], default: "inquiry_sent" }
});

module.exports = mongoose.model("BlockBookingInquiry", blockBookingInquirySchema);
