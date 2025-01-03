const mongoose = require("mongoose");
const { MONGO_URI } = require("./dotenv");

const connectDB = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("MongoDB Atlas connected");
	} catch (err) {
		console.error("MongoDB connection error:", err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
