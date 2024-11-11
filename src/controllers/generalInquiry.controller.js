const GeneralInquiry = require("../models/generalInquiry.model");
const sanitize = require("mongo-sanitize"); // For data sanitization

// 1. Create General Inquiry
exports.createGeneralInquiries = async (req, res) => {
  try {
    const userId = req.user.id;

    const inquiriesData = req.body.inquiries;
    if (!Array.isArray(inquiriesData) || inquiriesData.length === 0) {
      return res.status(400).json({ message: "No inquiries provided" });
    }

    const inquiries = await Promise.all(inquiriesData.map(async inquiryData => {
      const {
        quantity,
        quantityType,
        rate,
        deliveryStartDate,
        deliveryEndDate,
        ppc,
        certification,
        paymentMode,
        paymentDays,
        shipmentTerms,
        businessCondition,
        nomination,
        specifications,
        conewt,
        status
      } = inquiryData;

      // Validate required fields
      if (!quantity || !quantityType || !rate || !deliveryStartDate || !deliveryEndDate) {
        throw new Error("Missing required fields in one or more inquiries");
      }

      const newInquiry = new GeneralInquiry({
        customerId: userId, // Automatically set the customer ID from authenticated user
        quantity,
        quantityType,
        rate,
        deliveryStartDate,
        deliveryEndDate,
        ppc, // Optional fields
        certification,
        paymentMode,
        paymentDays,
        shipmentTerms,
        businessCondition,
        nomination,
        specifications,
        conewt,
        status
      });

      return newInquiry.save();
    }));

    res.status(201).json({
      message: `${inquiries.length} General Inquiries created successfully`,
      inquiries
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating General Inquiries", error: error.message });
  }
};


// 2. Get Inquiries for a Specific Customer
exports.getCustomerInquiries = async (req, res) => {
  try {
    const customerId = sanitize(req.params.customerId); // Sanitize the customerId
    const inquiries = await GeneralInquiry.find({ customerId }).lean(); // Use .lean() for better performance
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer inquiries", error: error.message });
  }
};

// 3. Get Inquiries for a Nominated Supplier
exports.getSupplierInquiries = async (req, res) => {
  try {
    const supplierId = sanitize(req.params.supplierId); // Sanitize the supplierId
    const inquiries = await GeneralInquiry.find({ nomination: supplierId }).lean(); // Use .lean() for better performance
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching supplier inquiries", error: error.message });
  }
};
