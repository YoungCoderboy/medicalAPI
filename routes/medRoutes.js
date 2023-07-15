const express = require("express");
const controller = require("./../controller/medController");
const authContorller = require("../controller/authContorller");
// console.log(controller)
const Router = express.Router();
// Router.param('id',controller.checkId )

Router.route("/top-5-cheap-medicine").get(controller.middleware, controller.getMeds);

Router.route("/")
  .get(authContorller.protect, controller.getMeds)
  .post(authContorller.protect,controller.createMeds);
Router.route("/:id")
  .get(controller.getMedsById)
  .patch(controller.updateMeds)
  .delete(
    authContorller.protect,
    authContorller.restrictTo("admin", "clinic"),
    controller.deleteMeds
  );

module.exports = Router;
