import fs from "fs";
import { logger } from "../utils/logger.js";

/**
 * Middleware to clean up uploaded files if validation fails
 * Must be placed after `validateRequest` in the route definition? 
 * NO, `validateRequest` calls `next(error)` which skips to error handler.
 * 
 * So asking to wrap `validateRequest` is better.
 */
export const validateWithFileCleanup = (validator) => async (req, res, next) => {
    try {
        await validator(req, res, next);
    } catch (error) {
        // Cleanup files if validation failed
        cleanupRequestFiles(req);
        next(error);
    }
};

// Helper for cleaning up files
export const cleanupRequestFiles = (req) => {
    if (req.file) {
        try {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (e) { logger.warn("Failed to delete file:", e); }
    }
    if (req.files) {
        Object.values(req.files).flat().forEach(file => {
            try {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            } catch (e) { logger.warn("Failed to delete file:", e); }
        });
    }
};
