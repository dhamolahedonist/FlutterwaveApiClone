const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    account_bank: {
      type: String,
      required: true,
    },
    account_number: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    narration: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    fee: {
      type: Number,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "GHS", "KES", "UGX", "TZS", "USD", "ZAR"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transfer", transferSchema);
