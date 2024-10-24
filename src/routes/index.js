const express = require("express");
const { protect } = require("../middleware/auth.middleware");

const userRoutes = require("./user.routes");
const paymentTermRoutes = require("./paymentTerms.routes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/payment-terms", paymentTermRoutes);

router.get("/agent-only", protect(["agent"]), (req, res) => {
	res.json({ message: "Agent access granted" });
});

module.exports = router;
