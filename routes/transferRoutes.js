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

const router = express.Router();

router.post("/transfers", createTransfer);
router.post("/bulk-transfers", createBulkTransfer);
router.get("/transfer-fees", getTransferFees);
router.get("/transfers", getAlltransfers);
router.get("/:id", getASingleTransfer);
router.get("/bulk-transfer/:id", getABulkTansfer);
router.get("/transfers/rates", computeTransferAmount);

module.exports = router;
