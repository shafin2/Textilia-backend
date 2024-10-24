const mongoose = require("mongoose");

const payment_termSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			validate: {
				validator: async function (value) {
					const user = await mongoose.model("User").findById(value);
					return user && user.businessType === "client";
				},
				message: (props) => `${props.value} is not a valid customer.`,
			},
		},
		supplier: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
			validate: {
				validator: async function (value) {
					if (!value) return true; // If supplier is not provided
					const user = await mongoose.model("User").findById(value);
					return user && user.businessType === "supplier";
				},
				message: (props) => `${props.value} is not a valid supplier.`,
			},
		},
		general: { type: Boolean, default: false }, // True for General Proposal
		mode: {
			type: String,
			enum: ["advance", "credit", "pdc", "advance_pdc", "lc"],
			required: true,
		},
		shipmentTerms: { type: String, required: true },
		businessConditions: {
			type: String,
			enum: ["efs", "gst", "non_gst"],
			required: true,
		},
		supplierShipmentTerms: { type: String },
		supplierBusinessConditions: {
			type: String,
			enum: ["efs", "gst", "non_gst"],
		},
		supplierEndDate: { type: Date },
		status: {
			type: String,
			enum: [
				"payment_term_sent_received",
				"payment_term_replied",
				"contract_sent_received",
				"contracted",
				"renew_requested_received",
			],
			default: "payment_term_sent_received",
		},
		revision: { type: Number, default: 0 },
		days: { type: Number, required: true },
		endDate: {
			type: Date,
			validate: {
				validator: function (value) {
					if (this.general) {
						return !value;
					}
					return value > new Date();
				},
				message: (props) => {
					if (this.general) {
						return "endDate must not be provided when general is true.";
					}
					return `${props.value} is not a valid date. It must be greater than the current date.`;
				},
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

module.exports = mongoose.model("Proposal", payment_termSchema);
