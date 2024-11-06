const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentTerm.controller");

router.get("/", paymentController.getAllPaymentTerms); // For debugging purposes
router.get("/users", paymentController.getAllUsers); // For debugging purposes
router.get("/users/:userId", paymentController.getAllNewSupplyChainProposals);
router.get("/general/:userId", paymentController.getGeneralPaymentTerm);
router.post("/general", paymentController.createGeneralPaymentTerm);
router.put(
	"/general/:generalTermId",
	paymentController.updateGeneralPaymentTerm
);
router.post("/new", paymentController.createNewPaymentTerm);
router.put("/renew", paymentController.renewPaymentTerm);
router.put("/reply", paymentController.replyToPaymentTerm);
router.put("/accept", paymentController.acceptContract);

module.exports = router;
