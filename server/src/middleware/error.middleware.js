import { ValidationError } from "express-validation";

export const errorHandle = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.details.body ? err.details.body[0].message : err.message,
      details: err.details,
    });
  }

  err.message ||= "Internal server error";
  err.statusCode ||= 500;

  // Only log actual server errors, not expected auth failures
  if (err.statusCode >= 500) {
    console.error(">>> [SERVER ERROR]:", err);
  } else if (err.statusCode !== 401 && err.statusCode !== 403) {
    // Log 4xx errors except 401/403 (auth failures are expected for guests)
    console.warn(">>> [CLIENT ERROR]:", err.message);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const TryCatchHandler = (controllerFun) => async (req, res, next) => {
  try {
    await controllerFun(req, res, next);
  } catch (error) {
    next(error);
  }
};
