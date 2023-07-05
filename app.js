const express = require("express");
const bodyParser = require("body-parser");
require("./config/db").connectToMongoDB(); // Connect to MongoDB
require("dotenv").config();
const transferRoute = require("./routes/transferRoutes");

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.json({ status: true });
});

app.use("/api/v1", transferRoute);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

module.exports = app;
