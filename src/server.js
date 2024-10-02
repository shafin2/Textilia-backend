require("dotenv").config({ path: "./env/local.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

var corsOptions = {
	origin: process.env.REMOTE_CLIENT_URL,
	optionsSuccessStatus: 200,
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const routes = require("./routes");
app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
