export const errorHandle = (err, req, res, next) => {
  console.error(">>> [SERVER ERROR]:", err);
  err.message ||= "Internal server error";
  err.statusCode ||= 500;

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
