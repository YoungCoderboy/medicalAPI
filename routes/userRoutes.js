const express = require("express");
const Router = express.Router();
const controller = require("./../controller/userController");
const authController = require("./../controller/authContorller");

Router.post("/signup", authController.signup);
Router.post("/login", authController.login);
Router.post("/forget", authController.forgetPassword);
Router.patch("/reset/:token", authController.resetPassword);
Router.patch(
  "/updatepass",
  authController.protect,
  authController.updatePassword
);
Router.patch("/updateme", authController.protect, controller.updateMe);
Router.delete("/deleteme", authController.protect, controller.deleteMe);

Router.route("/").get(controller.getAllUsers).post(controller.createUser);
Router.route("/:id")
  .get(controller.getUserById)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);
module.exports = Router;
