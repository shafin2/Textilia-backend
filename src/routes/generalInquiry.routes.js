const express = require("express");
const {
  createGeneralInquiries,
  getCustomerInquiries,
  getSupplierInquiries,
} = require("../controllers/generalInquiry.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create",protect(["client"]), createGeneralInquiries); 
router.get("/customer/:customerId", getCustomerInquiries); 
router.get("/supplier/:supplierId", getSupplierInquiries); 

module.exports = router;
