import { ValidationError } from "express-validation";
import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { cleanupRequestFiles } from "./fileCleanup.middleware.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const match = err.errmsg?.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : 'unknown';
  const message = `Duplicate field value: ${value}. That record already exists. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error("ERROR 💥", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export const errorHandle = (err, req, res, next) => {
  // Gracefully clean up any uploaded files if the request errors out
  cleanupRequestFiles(req);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.details.body && err.details.body.length > 0 ? err.details.body[0].message : err.message,
      ...(process.env.NODE_ENV !== "production" && { details: err.details }),
    });
  }

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;
  error.stack = err.stack; // Explicitly copy stack trace

  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(error, res);
  } else {
    // Fallback
    sendErrorProd(error, res);
  }
};

export const TryCatchHandler = (controllerFun) => async (req, res, next) => {
  try {
    await controllerFun(req, res, next);
  } catch (error) {
    next(error);
  }
};
