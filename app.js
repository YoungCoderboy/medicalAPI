// Description: This file will contain the configuration related to the Express server
const mongosanatize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const express = require("express");
const app = express();
const morgan = require("morgan");
const appError = require("./util/appError");
const errorHandler = require("./controller/errorContorller");
const hpp = require("hpp");

const medRouter = require("./routes/medRoutes");
const userRouter = require("./routes/userRoutes");
// add middleware for reading the data into request body
//Middleware
app.use(helmet()); //set secure http heaader
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log("Hola from middleware");
  next();
});
// limit the number of request for the same ip adderess
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // both this allow 100 request from same ip in 1 hr represent in millisecond
  message: "too many request for same ip, please try again after 1 hr ",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" })); // body parser to read the req paramater also limit the amount of data can be recive from the user

//! sanitation help to protect from attack
// !nosql injection

app.use(mongosanatize());

// ! xss attack
app.use(xss());

// ! prevent paramater pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingQuantity",
//       "ratingAverage",
//       "difficulty",
//       "price",
//     ],
//   })
// );

// this is use to serve static file
// app.use(express.static())
app.use("/api/v1/medi", medRouter);
app.use("/api/v1/user", userRouter);
app.all("*", (req, res, next) => {
  const newError = new appError(
    `Can't find ${req.originalUrl} on this server`,
    404
  );
  next(newError);
});

// !by specifying the four arguments in middleware we are explicitly defining that this middleware will handle the error(error handling middleware)
app.use(errorHandler);

module.exports = app;
