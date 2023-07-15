const crypto = require("crypto");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const User = require("./../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("./../util/email");

const signature = (uid) => {
  return jwt.sign({ id: uid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // this way we can avoid data manupulation
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  //create new token
  // TODO: create new function for this process
  const token = signature(newUser._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000
    ),
    // secure:true, make true when we use https request ie while in production
    httpOnly: true,
  });

  newUser.password = undefined; // doesnot remove password since we are not saving it it just avoid sending of password with request
  res.status(201).json({
    status: "success",
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1 check if email and password exits
  if (!email || !password)
    return next(new AppError("Please provide a valid email and password", 400));
  // 2 check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password"); // way to get user with hiden password
  // console.log(user);
  let correct = false;
  if (user) correct = await user.correctPassword(password, user.password);
  //   console.log(correct)
  if (!correct) return next(new AppError("Invalid password and Email", 401));

  // 3 if everything is ok then send token back
  const token = signature(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000
    ),
    // secure:true, make true when we use https request ie while in production
    httpOnly: true,
  });
  res.status(201).json({
    status: "success",
    token: token,
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  // 1 get the token
  let token = -1;
  const str = req.headers.authorization;
  // console.log(typeof str);

  if (str && str.startsWith("Bearer")) {
    token = str.split(" ")[1];
  }
  // console.log(token);

  if (token == -1) return next(new AppError("You are not login", 401));
  // 401 ==> not authorized

  // 2 validate the token
  // this funtion take callback function so to avoid this we use promisfly function from util library
  try {
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decode);
    // 3 chekc if user still exist
    const fresh = await User.findById(decode.id);
    // console.log(fresh);
    if (!fresh) return next(new AppError("This user is no longer exist", 401));

    if (fresh.changePasswordAfter(decode.iat))
      return next(new AppError("login session is expire", 401));

    req.user = fresh;
  } catch (error) {
    next(new AppError(error.message, 401));
  }
  // 4 user change password after token is issued
  next(); //! grant access to user for protected route
});

//  this is called wrapper function since we didnot have middleware with arunment
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array of roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Your have no access to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1 get user from posted email address
  const user = await User.findOne({ email: req.body.email });
  // console.log(user)
  if (!user) {
    return next(new AppError("This Email does not exist on our Database", 404));
  }
  // 2 generate random token
  const token = user.createPasswordResetToken();
  // console.log(user);
  await user.save({ validateBeforeSave: false }); //! no need to validate other data since only password has change
  //   console.log(wait)
  // 3 send to user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/reset/${token}`;
  const message = `forget your password? submit you password in patch request to ${resetURL}`;
  console.log(message, user.email);
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password request token",
      message: message,
    });
    res.status(200).json({
      success: "success",
      message: "Token send to email action successful",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There is error in sending the email", 501));
  }
});
exports.resetPassword = async (req, res, next) => {
  // 1. get the user from the token
  const token = req.params.token;
  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");
  // console.log(hashtoken);

  const user = await User.findOne({
    passwordResetToken: hashtoken,
    passwordResetExpire: { $gt: Date.now() },
  });
  // 2.if token is not expire and there is user set the password
  if (!user) return next(new AppError("Token is invalid or expire", 400));
  // 3. update the changePasswordat property
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  // 4. log the user in
  // console.log(user);
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save(); //! save to database
  // console.log(user);

  const loginToken = signature(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000
    ),
    // secure:true, make true when we use https request ie while in production
    httpOnly: true,
  });
  res.status(200).json({
    status: "Success",
    token: loginToken,
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  get the user from the collection
  const user = await User.findById(req.user.id).select("+password");
  // check the posted password is correct

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError("Your Entered Password is wrong", 401));
  }
  // console.log(user);
  // if correct password update password
  user.password = req.body.newpassword;
  user.confirmPassword = req.body.newpasswordconfirm;
  console.log(user);

  await user.save();
  // login the user
  const loginToken = signature(user._id);
  res.cookie("jwt", token, {
    //TODO: repetitive process make function
    expires: new Date(
      Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000
    ),
    // secure:true, make true when we use https request ie while in production
    httpOnly: true,
  });
  res.status(200).json({
    status: "Success",
    token: loginToken,
  });
});
