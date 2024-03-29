require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("./socket-handler");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/account", require("./routes/account"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * Errors handling
 */
app.use((err, req, res, next) => {
  if (
    err.name === "MongoError" ||
    err.name === "ValidationError" ||
    err.name === "CastError"
  ) {
    err.status = 422;
  }
  if (req.get("accept").includes("json")) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "some error eccured." });
  } else {
    res
      .status(err.status || 500)
      .sendFile(path.join(__dirname, "public", "index.html"));
  }
});

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    // useCreateIndex: true
  })
  .then(() => console.log("Connected Successfully"))
  .catch((err) => console.warn(err));

module.exports = app;
