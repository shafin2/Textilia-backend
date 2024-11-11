const express = require('express');
const router = express.Router();
const { createGeneralProposals, getCustomerProposals, getSupplierProposals, acceptGeneralProposal } = require('../controllers/generalProposal.controller');
const { protect } = require("../middleware/auth.middleware");


router.post('/create',protect(["supplier"]) ,createGeneralProposals);
router.get('/customer', protect(["client"]), getCustomerProposals);
router.get('/supplier',protect(["supplier"]), getSupplierProposals);
router.patch('/:proposalId/accept', protect(["client"]), acceptGeneralProposal);

module.exports = router;
