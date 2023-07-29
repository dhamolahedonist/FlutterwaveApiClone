const Transfer = require("../models/transferModel");
const RecipientsArray = require("../models/recipientModel");
const TransferFeeObject = require("../models/transferFeeModel");
const axios = require("axios");

// Define the transfer fees for different currencies
const transferFees = {
  NGN: 45,
  KES: 100,
  GHS: 5,
  USD: 40,
  UGX: 5000,
  TZS: 3000,
  GBP: 35,
  EUR: 35,
  ZMW: 62.6,
  ZAR: 10,
  RWF: 1000,
};

const generatedReferences = new Set();

function generateUniqueReference() {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const randomString = [...Array(5)]
    .map(() => characters[Math.floor(Math.random() * characters.length)])
    .join("");

  const reference = `${randomString}-pstmnpyt-rfxx${Math.floor(
    Math.random() * 1000
  )
    .toString()
    .padStart(3, "0")}_PMCKDU_1`;

  if (generatedReferences.has(reference)) {
    return generateUniqueReference();
  }

  generatedReferences.add(reference);
  return reference;
}

const createTransfer = async (req, res) => {
  try {
    const { account_bank, account_number, amount, narration, currency } =
      req.body;

    // Generate a unique refence
    const reference = generateUniqueReference();

    //  Retrieve the fee based on the selected currency
    const fee = transferFees[currency] || 0;

    const userId = req.user.user._id;

    const val = await Transfer.create({
      account_bank,
      account_number,
      amount,
      narration,
      currency,
      reference,
      fee,
      userId,
    });
    return res.status(200).json({
      success: true,
      message: "Transfer Queued Successfully",
      data: val,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const createBulkTransfer = async (req, res) => {
  const { recipients } = req.body;

  try {
    const reference = generateUniqueReference();
    const userId = req.user.user._id;

    const bulkTransfer = await RecipientsArray.create({
      recipients: recipients.map((recipient) => {
        const fee = transferFees[recipient.currency] || 0; // Retrieve the fee based on the recipient's currency
        return {
          ...recipient,
          reference,
          fee,
          userId,
        };
      }),
    });

    const { _id, createdAt } = bulkTransfer.recipients[0];

    return res.status(200).json({
      success: true,
      message: "Bulk transfer queued",
      data: {
        id: _id,
        createdAt: createdAt.toISOString(),
        Approver: "N/A",
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getTransferFees = async (req, res) => {
  try {
    const data = TransferFeeObject;
    return res.status(200).json({
      status: "success",
      message: "Transfer fee fetched",
      data: data,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAlltransfers = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const data = await Transfer.find({ userId }).sort({ $natural: -1 }).lean();

    const perPage = 2;
    const currentPage = parseInt(req.query.page) || 1;

    const totalObject = data.length;
    const totalPages = Math.ceil(totalObject / perPage);

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;

    const transfersForPage = data.slice(startIndex, endIndex);

    res.status(200).json({
      status: "success",
      message: "Transfers fetched",
      meta: {
        page_info: {
          total: totalObject,
          current_page: currentPage,
          total_pages: totalPages,
        },
      },
      data: transfersForPage,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getASingleTransfer = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const transferId = req.params.id;

    const val = await Transfer.findById(transferId).lean();

    if (!val || val.userId.toString() !== userId) {
      return res.status(401).json({
        status: "false",
        message: "Transfer not found or not authorized for this user",
      });
    }

    // If the transfer was created by the user, return the transfer details
    res
      .status(200)
      .json({ status: "success", message: "Transfer fetched", val });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getABulkTansfer = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const transferId = req.params.id;

    const bulkTransfer = await RecipientsArray.findOne({
      recipients: {
        $elemMatch: {
          _id: transferId,
          userId: userId,
        },
      },
    });

    if (!bulkTransfer) {
      return res
        .status(401)
        .json({ status: "false", message: "Bulk Transfer not found" });
    }

    // Now `bulkTransfer` contains the entire bulk transfer document,
    // including the recipient with the specified `_id` and matching `userId`.
    res.status(200).json({
      status: "success",
      message: "Transfer fetched",
      data: bulkTransfer,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const computeTransferAmount = async (req, res) => {
  const { amount, destination_currency, source_currency } = req.query;

  const currencyRates = {
    USD: {
      NGN: 800.24,
      EUR: 0.85,
    },
    NGN: {
      USD: 0.00660195,
      EUR: 0.002,
    },
    EUR: {
      USD: 0.85,
      NGN: 600,
    },
  };

  const rate = currencyRates[source_currency][destination_currency];
  const transferAmount = amount * rate;

  return res.status(200).json({
    status: "success",
    message: "Transfer amount fetched",
    data: {
      rate: rate,
      source: {
        currency: source_currency,
        amount: amount,
      },
      destination: {
        currency: destination_currency,
        amount: Math.floor(transferAmount),
      },
    },
  });
};

const retryTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the transfer to retry
    const transferToRetry = await Transfer.findById(id);
    if (!transferToRetry) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // Create a new transfer with the same details as the original transfer
    const newTransfer = await Transfer.create({
      account_bank: transferToRetry.account_bank,
      account_number: transferToRetry.account_number,
      amount: transferToRetry.amount,
      narration: transferToRetry.narration,
      currency: transferToRetry.currency,
      reference: generateUniqueReference(),
      fee: transferToRetry.fee,
      retryTransferId: id, // Set the retryTransferId to the ID of the original transfer
    });

    return res.status(200).json({
      success: "success",
      message: "Transfer retry attempt queued",
      data: retryAttempts,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const getARetryTransfer = async (req, res) => {
  try {
    const val = await Transfer.findById(req.params.id);
    if (!val) {
      return res
        .status(401)
        .json({ status: "false", message: "Transfer retried not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Transfer retry attempts retrieved.",
      data: {
        status: "PENDING",
        complete_message: "Transfer is currently being processed",
        narration: null,
        val,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createTransfer,
  createBulkTransfer,
  getTransferFees,
  getAlltransfers,
  getASingleTransfer,
  getABulkTansfer,
  computeTransferAmount,
  retryTransfer,
  getARetryTransfer,
};
