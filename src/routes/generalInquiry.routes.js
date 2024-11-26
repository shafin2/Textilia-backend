const express = require("express");
const {
	createGeneralInquiries,
	getCustomerInquiries,
	getSupplierInquiries,
	closeInquiry,
	getGeneralInquiryById,
} = require("../controllers/generalInquiry.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create", protect(["client"]), createGeneralInquiries);
router.get("/:inquiryId", getGeneralInquiryById);
router.get("/customer/:customerId", getCustomerInquiries);
router.get("/supplier/:supplierId", getSupplierInquiries);
router.post("/close/:inquiryId", protect(["client"]), closeInquiry);

module.exports = router;
