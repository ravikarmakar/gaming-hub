import { CustomError } from "../utils/CustomError.js";
import { TryCatchHandler } from "./error.middleware.js";

/**
 * Support Window Middleware
 * Checks if the current UTC time is within the allowed support window.
 * Default: 08:00 to 20:00 UTC
 */
export const checkSupportWindow = (startHour = 8, endHour = 20) => {
    return TryCatchHandler(async (req, res, next) => {
        const now = new Date();
        const currentHour = now.getUTCHours();

        const isOpen = currentHour >= startHour && currentHour < endHour;

        // Attach status to request for use in controllers
        req.isSupportOpen = isOpen;

        // If it's a chat send request, we can optionally block it here
        // For now, we just pass the info through
        next();
    });
};

/**
 * Helper to check if support is open (for non-middleware usage like Socket.io)
 */
export const isSupportOpen = (startHour = 8, endHour = 20) => {
    const currentHour = new Date().getUTCHours();
    return currentHour >= startHour && currentHour < endHour;
};
