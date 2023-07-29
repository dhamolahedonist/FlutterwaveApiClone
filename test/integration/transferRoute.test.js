const app = require("../../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = require("chai").expect;
process.env.MONGODB_URI = "mongodb://localhost:27017/flutterwaveApiClone";

const userModel = require("../../models/userModel");
const transferModel = require("../../models/transferModel");
const receiptModel = require("../../models/recipientModel");

const header = {
  Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY0YzUwN2JhNDE3N2FkYTAzMjM3N2M3OSIsImVtYWlsIjoib2R1YmFzYW11ZWw2NkBnbWFpbC5jb20ifSwiaWF0IjoxNjkwNjY5MDYxLCJleHAiOjE2OTA2NzI2NjF9.30KVQgs8yqeLaaMLBnKAMzmlhPQ3o6inZ8PSmtPhNeQ`,
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

  it("create a bulk-transfer", async () => {
    return new Promise(async (resolve) => {
      await cleanup();

      chai
        .request(app)
        .post("/api/v1/bulk-transfers")
        .set(header)
        .send({
          recipients: [
            {
              first_name: "John",
              last_name: "Doe",
              email: "john.doe@example.com",
              mobile_number: "1234567890",
              recipient_address: "123 Main St",
              amount: 1200,
              currency: "USD",
            },
            {
              first_name: "Jane",
              last_name: "Smith",
              email: "jane.smith@example.com",
              mobile_number: "9876543210",
              recipient_address: "456 Elm St",
              amount: 10000,
              currency: "NGN",
            },
          ],
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
  it("calculate transfer money correctly", async () => {
    return new Promise(async (resolve) => {
      const amount = 100;
      const source_currency = "USD";
      const destination_currency = "NGN";

      chai
        .request(app)
        .get("/api/v1/transfers/rates")
        .query({ amount, source_currency, destination_currency })

        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("object");
          response.body.should.have.property("status").equal("success");
          response.body.should.have.property("data");
          response.body.data.should.have.property("rate");
          response.body.data.should.have.property("source");
          response.body.data.should.have.property("destination");

          // Add your specific assertions based on the calculation logic
          response.body.data.rate.should.equal(800.24);
          response.body.data.source.currency.should.equal(source_currency);
          response.body.data.source.amount.should.equal("100");
          response.body.data.destination.currency.should.equal(
            destination_currency
          );
          response.body.data.destination.amount.should.equal(
            Math.floor(amount * 800.24)
          );

          resolve();
        });
    });
  });
});
