const express = require('express');
const router = express.Router();
const { createGeneralProposals, getCustomerProposals, getSupplierProposals, acceptGeneralProposal, getInquiryProposals } = require('../controllers/generalProposal.controller');
const { protect } = require("../middleware/auth.middleware");


router.post('/create',protect(["supplier"]) ,createGeneralProposals);
router.get('/customer', protect(["client"]), getCustomerProposals);
router.get('/supplier',protect(["supplier"]), getSupplierProposals);
router.post('/:proposalId/accept', protect(["client"]), acceptGeneralProposal);
router.get("/inquiryProposals/:inquiryId", getInquiryProposals);

module.exports = router;
