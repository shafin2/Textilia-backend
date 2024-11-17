const BlockBookingInquiry = require("../models/blockBookingInquiry.model");
const sanitize = require("mongo-sanitize"); // For data sanitization


// Create a new block booking inquiry
exports.createInquiry = async (req, res) => {
    console.log("Request Received");
    console.log(req.body);

    try {
        const inquiryData = req.body;

        // Validate `countPrices`
        if (!Array.isArray(inquiryData.countPrices)) {
            return res.status(400).json({ message: "`countPrices` must be an array." });
        }

        if (inquiryData.upperCount < inquiryData.lowerCount) {
            return res.status(400).json({ message: "Upper count cannot be less than lower count." });
        }

        // Ensure countPrices cover all counts between lower and upper count
        const expectedCounts = [];
        for (let i = inquiryData.lowerCount; i <= inquiryData.upperCount; i++) {
            expectedCounts.push(i);
        }

        const providedCounts = inquiryData.countPrices.map(cp => cp.count);
        const missingCounts = expectedCounts.filter(c => !providedCounts.includes(c));
        if (missingCounts.length > 0) {
            return res.status(400).json({ message: `Missing prices for counts: ${missingCounts.join(", ")}` });
        }

        // Attach customerId from authenticated user
        inquiryData.customerId = req.user.id;

        const inquiry = new BlockBookingInquiry(inquiryData);
        const savedInquiry = await inquiry.save();
        res.status(201).json(savedInquiry);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get all inquiries for the logged-in customer
exports.getInquiries = async (req, res) => {
    console.log("Aya")
    try {
        const customerId = sanitize(req.params.customerId); // Sanitize the customerId
        const inquiries = await BlockBookingInquiry.find({ customerId: customerId });
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
