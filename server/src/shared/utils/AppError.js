class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Distinguish operational errors from programming bugs
        this.errorCode = errorCode || null;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
