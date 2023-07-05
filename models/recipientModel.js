const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    recipient_address: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
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

const recipientsArraySchema = new mongoose.Schema({
  recipients: [recipientSchema],
});

const RecipientsArray = mongoose.model(
  "RecipientsArray",
  recipientsArraySchema
);

module.exports = RecipientsArray;
