const { findById } = require("../model/medModel");
const AppError = require("../util/appError");
const User = require("./../model/userModel");
const catchAsync = require("./../util/catchAsync");

const filterObj = (obj, ...allow) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allow.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(AppError("This route is not for updating the password"));

  const filterData = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    data: {
      user: updatedUser,
    },
  });
};
exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "Success",
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users: users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route us yet to implemented",
  });
};

exports.getUserById = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route us yet to implemented",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route us yet to implemented",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route us yet to implemented",
  });
};
