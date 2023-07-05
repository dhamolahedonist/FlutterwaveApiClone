const Transfer = require("../models/transferModel");
const RecipientsArray = require("../models/recipientModel");
const TransferFeeObject = require("../models/transferFeeModel");

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

    const val = await Transfer.create({
      account_bank,
      account_number,
      amount,
      narration,
      currency,
      reference,
      fee,
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

    const bulkTransfer = await RecipientsArray.create({
      recipients: recipients.map((recipient) => {
        const fee = transferFees[recipient.currency] || 0; // Retrieve the fee based on the recipient's currency
        return {
          ...recipient,
          reference,
          fee,
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
    const data = await Transfer.find({}).sort({ $natural: -1 }).lean();

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
    const val = await Transfer.findById(req.params.id);
    if (!val) {
      return res
        .status(401)
        .json({ status: "false", message: "Transfer not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Transfer fetched", val });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getABulkTansfer = async (req, res) => {
  try {
    const val = await RecipientsArray.findById(req.params.id);
    if (!val) {
      return res
        .status(401)
        .json({ status: "false", message: "Bulk Transfer not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Transfer fetched", val });
  } catch (error) {
    res.status(500).json(error);
  }
};

const computeTransferAmount = (req, res) => {
  const { amount, destination_currency, source_currency } = req.query;

  const currencyRates = {
    USD: {
      NGN: 624.24,
      EUR: 0.85,
    },
    NGN: {
      USD: 0.00160195,
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

module.exports = {
  createTransfer,
  createBulkTransfer,
  getTransferFees,
  getAlltransfers,
  getASingleTransfer,
  getABulkTansfer,
  computeTransferAmount,
};
