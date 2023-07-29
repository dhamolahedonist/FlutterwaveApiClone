const express = require("express");
const {
  createTransfer,
  createBulkTransfer,
  getTransferFees,
  getAlltransfers,
  getASingleTransfer,
  getABulkTansfer,
  computeTransferAmount,
} = require("../controllers/transferController");
const { verifyToken } = require("../middlewares/validateUser");

const router = express.Router();

router.post("/transfers", verifyToken, createTransfer);
router.post("/bulk-transfers", verifyToken, createBulkTransfer);
router.get("/transfer-fees", getTransferFees);
router.get("/transfers", verifyToken, getAlltransfers);
router.get("/:id", verifyToken, getASingleTransfer);
router.get("/bulk-transfer/:id", verifyToken, getABulkTansfer);
router.get("/transfers/rates", computeTransferAmount);

module.exports = router;
