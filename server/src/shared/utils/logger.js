import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";

// Define log directory
const logDir = "logs";

// Define log format
const logFormat = winston.format.combine(
    winston.format.errors({ stack: true }), // handle error objects
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    })
);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
    format: logFormat,
    transports: [
        // debug log setting
        new winston.transports.DailyRotateFile({
            level: "debug",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/debug", // log file /logs/debug/*.log
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            json: false,
            zippedArchive: true,
        }),
        // error log setting
        new winston.transports.DailyRotateFile({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error", // log file /logs/error/*.log
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            handleExceptions: true,
            json: false,
            zippedArchive: true,
        }),
    ],
});

logger.add(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, stack }) => {
                return `${timestamp} ${level}: ${stack || message}`;
            })
        ),
    })
);

const stream = {
    write: (message) => {
        const trimmedMessage = message.trim();
        if (trimmedMessage.length > 0) {
            logger.info(trimmedMessage);
        }
    },
};

export { logger, stream };
