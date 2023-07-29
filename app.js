const express = require("express");
const bodyParser = require("body-parser");
const transferRoute = require("./routes/transferRoutes");
const passport = require("passport");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");

require("dotenv").config();

require("./config/db").connectToMongoDB(); // Connect to MongoDB
require("./config/authController");

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.json({ status: true });
});

app.use("/api/v1/auth", authRoute);

app.use(
  "/api/v1/user",
  passport.authenticate("jwt", { session: false }),
  userRoute
);

app.use("/api/v1", transferRoute);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

module.exports = app;
