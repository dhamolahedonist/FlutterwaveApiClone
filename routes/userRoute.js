const express = require("express");
const userController = require("../config/userController");

const userRoute = express.Router();

userRoute.put("/:id", userController.updateUSer);
userRoute.get("/:id", userController.getUser);

module.exports = userRoute;
