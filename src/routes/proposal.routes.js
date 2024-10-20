const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposal.controller");

// Create General Proposal
router.post("/general", proposalController.createGeneralProposal);
router.put("/general", proposalController.updateGeneralProposal);
router.post("/new", proposalController.createNewProposal);
router.put("/renew", proposalController.renewProposal);
router.put("/reply", proposalController.replyToProposal);
router.put("/accept", proposalController.acceptContract);

module.exports = router;
