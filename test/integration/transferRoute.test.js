const app = require("../../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = require("chai").expect;
process.env.MONGODB_URI = "mongodb://localhost:27017/flutterwaveApiClone";

const userModel = require("../../models/userModel");
const transferModel = require("../../models/transferModel");
const receiptModel = require("../../models/recipientModel");

const header = {
  Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY0YzUwN2JhNDE3N2FkYTAzMjM3N2M3OSIsImVtYWlsIjoib2R1YmFzYW11ZWw2NkBnbWFpbC5jb20ifSwiaWF0IjoxNjkwNjQzMTI0LCJleHAiOjE2OTA2NDY3MjR9.iwpSC7YimldifIU64TmRkKtMlDxz9xGxgqZJOpckf78`,
};

const user_id = "64c507ba4177ada032377c79";

chai.use(chaiHttp);
chai.should();
chai.expect();

const cleanup = async () => {
  await transferModel.deleteMany();
};

describe("Initiate a transfer", () => {
  it("create a transfer", async () => {
    return new Promise(async (resolve) => {
      await cleanup();

      chai
        .request(app)
        .post("/api/v1/transfers")
        .set(header)
        .send({
          account_bank: "044",
          account_number: "0690000040",
          amount: 500,
          narration: "Akhlm Pstmn Trnsfr xx007",
          currency: "USD",
        })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("success");
          response.body.should.have.property("message");
          response.body.should.have.property("data");
          resolve();
        });
    });
  });
});
