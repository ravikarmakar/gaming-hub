import AppError from "./AppError.js";

export class CustomError extends AppError {
  constructor(message, statusCode, errorCode) {
    super(message, statusCode, errorCode);
  }
}
