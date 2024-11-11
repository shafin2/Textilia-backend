const mongoose = require("mongoose");

const generalInquirySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",

      index: true,
      validate: {
        validator: async function (value) {
          const user = await mongoose.model("User").findById(value);
          return user && user.businessType === "client";
        },
        message: (props) => `${props.value} is not a valid customer.`,
      },
    },
    ppc: { type: Number },
    quantity: { type: Number, required: true },
    quantityType: {
      type: String,
      enum: ["kg", "lbs", "bags"],
      required: true
    },
    rate: { type: Number },
    deliveryStartDate: { type: Date, required: true },
    deliveryEndDate: { type: Date,required: true },
    certification: {
      type: [String],
      enum: ["GOTS", "RWS", "Global Recycled Standard", "EU Ecolabel"],

    },
    paymentMode: {
      type: String,
      enum: ["advance", "credit", "pdc", "advance_pdc", "lc"],

    },
    paymentDays: { type: Number },
    shipmentTerms: { type: String },
    businessCondition: {
      type: String,
      enum: ["efs", "gst", "non_gst"],

    },
    nomination: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    specifications: { type: String },
    conewt: { type: Number },
    status: {
      type: String,
      enum: [
        "inquiry_sent",
        "inquiry_replied"
      ],
      default: "inquiry_sent",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searching
generalInquirySchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model("GeneralInquiry", generalInquirySchema);
