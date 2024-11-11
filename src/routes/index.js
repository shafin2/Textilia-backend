const express = require("express");
const { protect } = require("../middleware/auth.middleware");

const authRoutes = require("./auth.routes");
const userRoutes = require("./users.routes");
const paymentTermRoutes = require("./paymentTerms.routes");
const generalInquiryRoutes = require("./generalInquiry.routes");
const generalProposalRoutes = require('./generalProposal.routes');

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/payment-terms", paymentTermRoutes);
router.use("/general-inquiries", generalInquiryRoutes);
router.use('/general-proposals', generalProposalRoutes);
router.get("/agent-only", protect(["agent"]), (req, res) => {
	res.json({ message: "Agent access granted" });
});

module.exports = router;
