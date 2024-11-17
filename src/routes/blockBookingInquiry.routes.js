const express = require("express");
const router = express.Router();
const blockBookingInquiryController = require("../controllers/blockBookingInquiry.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/create", protect(["client"]), blockBookingInquiryController.createInquiry);

// Route to get all inquiries for a customer
router.get("/customer/:customerId", blockBookingInquiryController.getInquiries);

module.exports = router;
