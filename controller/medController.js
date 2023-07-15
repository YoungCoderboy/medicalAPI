const AppError = require("../util/appError");
const Medicine = require("../model/medModel");
const APIFeature = require("../util/apiFeature");
const catchAsync = require("../util/catchAsync");

exports.middleware = (req, res, next) => {
  req.query.fields = "name,price,description";
  req.query.sort = "-price";
  req.query.limit = "5";
  next();
};

exports.getMeds = catchAsync(async (req, res, next) => {
  const feature = new APIFeature(Medicine.find(), req.query)
    .filter()
    .sort()
    .fields()
    .page();
  const medicine = await feature.query;

  res.status(200).json({
    status: "success",
    result: medicine.length,
    data: {
      medicine: medicine,
    },
  });
});

exports.getMedsById = catchAsync(async (req, res, next) => {
  const params = req.params;
  const med = await Medicine.findById(params.id);
  if (!med) {
    return next(new AppError("No medicine found for id " + params.id, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tours: med,
    },
  });
});

exports.createMeds = catchAsync(async (req, res, next) => {
  const newMed = await Medicine.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newMed,
    },
  });
});

exports.updateMeds = catchAsync(async (req, res, next) => {
  const newMed = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true,
  });
  if (!newMed) {
    return next(new AppError("No Medicine found for id " + params.id, 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      tour: newMed,
    },
  });
 
});
exports.deleteMeds = catchAsync(async (req, res, next) => {
  const med = await Medicine.findByIdAndDelete(req.params.id);
  if (!med) {
    return next(new AppError("No Medicine found for id " + params.id, 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
 
});
