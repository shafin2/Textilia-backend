const express = require("express");
const { protect } = require("../middleware/auth.middleware");

const userRoutes = require("./user.routes");
const proposalRoutes = require("./proposal.routes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/proposals", proposalRoutes);

router.get("/agent-only", protect(["agent"]), (req, res) => {
	res.json({ message: "Agent access granted" });
});

module.exports = router;
