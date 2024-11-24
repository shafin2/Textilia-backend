const express = require("express");
const { protect } = require("../middleware/auth.middleware");

const authRoutes = require("./auth.routes");
const userRoutes = require("./users.routes");
const supplyChainRoutes = require("./supplyChainTerms.routes");
const generalInquiryRoutes = require("./generalInquiry.routes");
const generalProposalRoutes = require("./generalProposal.routes");
const blockBookingInquiryRoutes = require("./blockBookingInquiry.routes");
const blockBookingProposalRoutes = require("./blockBookingProposal.routes");
const contractRoutes = require("./contracts.routes");
// Add the block booking inquiry routes

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/payment-terms", supplyChainRoutes);
router.use("/general-inquiries", generalInquiryRoutes);
router.use("/general-proposals", generalProposalRoutes);
router.use("/block-booking-inquiries", blockBookingInquiryRoutes);
router.use("/block-booking-proposals", blockBookingProposalRoutes);
router.use("/contracts", contractRoutes);
router.get("/agent-only", protect(["agent"]), (req, res) => {
	res.json({ message: "Agent access granted" });
});

module.exports = router;
