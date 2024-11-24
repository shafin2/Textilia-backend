const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
	sendContract,
	getContractById,
	getAllUserContracts,
	getAllNewUserContracts,
	acceptContract,
} = require("../controllers/contract.controller");

router.get("/:id", protect(["supplier", "client"]), getContractById);
router.get(
	"/all/:userId",
	protect(["supplier", "client"]),
	getAllUserContracts
);
router.get(
	"/new/:userId",
	protect(["supplier", "client"]),
	getAllNewUserContracts
);
router.post("/create", protect(["supplier"]), sendContract);
router.post("/accept/:id", protect(["client"]), acceptContract);

module.exports = router;
