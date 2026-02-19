import { getIO } from "../../shared/config/socket.config.js";
import * as adminService from "./admin.service.js";
import { logger } from "../../shared/utils/logger.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Scopes, Roles } from "../../shared/constants/roles.js";

export const initializeAdminGateway = () => {
    const io = getIO();
    const adminNamespace = io.of("/admin");

    // Middleware for admin namespace authentication
    adminNamespace.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const accessToken = cookies.accessToken;

            if (!accessToken) return next(new Error("Authentication required"));

            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            // Check for Super Admin role
            const isSuperAdmin = decoded.roles?.some(
                r => r.scope === Scopes.PLATFORM && r.role === Roles.PLATFORM.SUPER_ADMIN
            );

            if (!isSuperAdmin) {
                logger.warn(`Unauthorized admin socket attempt from user: ${decoded.userId}`);
                return next(new Error("Forbidden: Super Admin access required"));
            }

            socket.userId = decoded.userId;
            next();
        } catch (error) {
            logger.error("Admin socket authentication failed:", error.message);
            next(new Error("Invalid authentication"));
        }
    });

    adminNamespace.on("connection", (socket) => {
        logger.info(`Admin connected: ${socket.id} (User: ${socket.userId})`);

        // Send initial stats
        adminService.getDashboardStats().then(stats => {
            socket.emit("stats:update", stats);
        }).catch(err => logger.error("Failed to send initial admin stats:", err));

        socket.on("disconnect", () => {
            logger.info(`Admin disconnected: ${socket.id}`);
        });
    });

    // Debounced Broadcast: Send platform stats every 10 seconds to all connected admins
    setInterval(async () => {
        try {
            if (adminNamespace.sockets.size > 0) {
                const stats = await adminService.getDashboardStats();
                adminNamespace.emit("stats:update", stats);
            }
        } catch (error) {
            logger.error("Error broadcasting admin stats:", error);
        }
    }, 10000);

    logger.info("Admin Socket Gateway initialized on /admin namespace");
};
