const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const validateRegister = require("../middlewares/validationRegister");
const EXPIRES_IN = `1h`;
require("dotenv").config();

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateRegister,
  passport.authenticate("signup", { session: false }),
  async (req, res) => {
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { first_name: req.body.first_name, last_name: req.body.last_name },
      { new: true }
    );

    if (req.user.error) {
      return res.json({
        status: "Failed",
        message: req.user.error,
      });
    }

    return res.json({
      status: "Successful",
      message: "Singup Successful",
      data: {
        id: user._id,
      },
    });
  }
);

authRouter.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        const error = new Error("Username or password is incorrect");
        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, email: user.email };

        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
          expiresIn: EXPIRES_IN,
        });

        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = authRouter;
