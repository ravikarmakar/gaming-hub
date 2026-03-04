import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import Team from "../../modules/team/team.model.js";
import User from "../../modules/user/user.model.js";
import { logger } from "../utils/logger.js";
import { Roles, Scopes } from "../constants/roles.js";
import { initializeIORedis } from "./ioredis.js";
import { redis } from "./redis.js";

let io;

/**
 * Determine the user's role in a team using their profile.
 */
export const determineRoleFromProfile = (userProfile, teamId) => {
    if (!userProfile || !userProfile.roles) return null;

    const teamRoleObj = userProfile.roles.find(
        (r) => r.scope === Scopes.TEAM && r.scopeId?.toString() === teamId.toString()
    );

    if (!teamRoleObj) return null;

    if (teamRoleObj.role === Roles.TEAM.OWNER) return "owner";
    if (teamRoleObj.role === Roles.TEAM.MANAGER) return "manager";
    return "member";
};

/**
 * Fallback to DB to determine user's role in a team.
 */
export const determineRoleFromDB = async (userId, teamId) => {
    try {
        const team = await Team.findOne({ _id: teamId, isDeleted: false }).select("captain teamMembers").lean();
        if (!team) return null;

        if (team.captain && team.captain.toString() === userId.toString()) {
            return "owner";
        }

        const member = team.teamMembers?.find(
            (m) => m.user?.toString() === userId.toString()
        );

        if (member?.roleInTeam === "manager") return "manager";
        if (member) return "member";

        return null;
    } catch (err) {
        logger.error(`Failed to determine role from DB for team ${teamId}:`, err.message);
        return null;
    }
};

/**
 * Mask PII (IDs) for logs to balance security and debuggability.
 * Masks short strings entirely and shows only start/end for standard IDs.
 */
const maskId = (id) => {
    if (!id) return "unknown";
    const str = id.toString();
    // For very short IDs, mask entirely to prevent accidental exposure
    if (str.length < 8) return "****";
    return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
};

/**
 * Helper to check if a user is a member of a team
 */
const checkMembership = async (userId, teamId) => {
    const cacheKey = `socket_member:${userId}:${teamId}`;
    let isMember = false;

    try {
        const cached = await redis.get(cacheKey);
        if (cached === "1" || cached === 1) {
            isMember = true;
        }
    } catch (cacheErr) {
        logger.error(`Redis cache check failed for socket membership:`, cacheErr.message);
    }

    if (!isMember) {
        const dbResult = await Team.exists({
            _id: teamId,
            "teamMembers.user": userId,
            isDeleted: false
        });

        if (dbResult) {
            isMember = true;
            redis.set(cacheKey, "1", { ex: 60 })
                .catch(err => logger.error(`Failed to cache socket membership:`, err.message));
        }
    }

    return isMember;
};

/**
 * Initialize Socket.IO server with authentication
 */
export const initializeSocket = async (httpServer) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        logger.error("CRITICAL: ACCESS_TOKEN_SECRET is not defined in environment variables");
        throw new Error("ACCESS_TOKEN_SECRET is required for Socket.IO authentication");
    }

    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Attach Redis adapter for horizontal scaling (multi-process)
    const { pubClient, subClient } = await initializeIORedis();
    if (pubClient && subClient) {
        io.adapter(createAdapter(pubClient, subClient));
        logger.info("Socket.IO Redis adapter attached — horizontal scaling enabled.");
    } else {
        logger.warn("Socket.IO running without Redis adapter — single-process mode only.");
    }

    // Authentication middleware - use cookies like the rest of the app
    io.use((socket, next) => {
        try {
            // Extract cookies from handshake
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const accessToken = cookies.accessToken;

            if (!accessToken) {
                return next(new Error("Authentication required"));
            }

            // Verify JWT token
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            // Attach user data to socket
            socket.userId = decoded.userId;
            socket.roles = decoded.roles || [];

            logger.info(`Socket authenticated: ${maskId(socket.userId)}`);
            next();
        } catch (error) {
            logger.error("Socket authentication failed:", error.message);
            next(new Error("Invalid authentication"));
        }
    });

    // Connection handler
    io.on("connection", (socket) => {
        logger.info(`Client connected: ${socket.id} (User: ${maskId(socket.userId)})`);

        // Join personal user room for private updates (e.g., profile/membership changes)
        socket.join(`user:${socket.userId}`);
        logger.info(`User ${maskId(socket.userId)} joined personal room: user:${maskId(socket.userId)}`);

        // Generic Chat Join handler
        socket.on("join:chat", async ({ targetId, scope }) => {
            if (!targetId || !scope) return;
            if (!["team", "organizer"].includes(scope)) return;
            if (!mongoose.Types.ObjectId.isValid(targetId)) return;

            try {
                const ChatService = (await import("../../modules/chat/chat.service.js")).default;
                const hasAccess = await ChatService.checkAccess(scope, socket.userId, targetId);

                if (!hasAccess) {
                    logger.warn(`Unauthorized join:chat attempt: User ${maskId(socket.userId)} tried to join ${scope}:${maskId(targetId)}`);
                    socket.emit("error", { message: `Unauthorized to join this ${scope} chat` });
                    return;
                }

                const room = `chat:${scope}:${targetId}`;
                socket.join(room);
                logger.info(`User ${maskId(socket.userId)} joined chat room: ${room}`);
            } catch (error) {
                logger.error(`Error in join:chat for ${scope}:${maskId(targetId)}:`, error.message);
            }
        });

        // Generic Chat Leave handler
        socket.on("leave:chat", ({ targetId, scope }) => {
            if (!targetId || !scope) return;
            if (!["team", "organizer"].includes(scope)) return;
            const room = `chat:${scope}:${targetId}`;
            socket.leave(room);
            logger.info(`User ${maskId(socket.userId)} left chat room: ${room}`);
        });

        // Chat message handler (Refactored to be generic)
        socket.on("chat:message", async (data) => {
            const { targetId, content, scope = "team" } = data;

            if (!targetId || !content) return;

            try {
                if (!mongoose.Types.ObjectId.isValid(targetId)) return;

                const ChatService = (await import("../../modules/chat/chat.service.js")).default;

                // 1. Authorization check
                const hasAccess = await ChatService.checkAccess(scope, socket.userId, targetId);
                if (!hasAccess) {
                    logger.warn(`Unauthorized chat attempt: User ${maskId(socket.userId)} for ${scope}:${maskId(targetId)}`);
                    socket.emit("error", { message: `Unauthorized to send message to this ${scope} chat` });
                    return;
                }

                // 2. Fetch user profile (cached in Redis)
                let userProfile = null;
                try {
                    const cached = await redis.get(`user_profile:${socket.userId}`);
                    if (cached) {
                        userProfile = typeof cached === "string" ? JSON.parse(cached) : cached;
                    }
                } catch (err) {
                    logger.error("Failed to get user profile from Redis for chat:", err.message);
                }

                if (!userProfile) {
                    userProfile = await User.findById(socket.userId).lean();
                    if (userProfile) {
                        redis.set(`user_profile:${socket.userId}`, JSON.stringify(userProfile), { ex: 60 });
                    }
                }

                if (!userProfile) return;

                // 3. Persist and Broadcast via Service
                const newMessage = await ChatService.createMessage({
                    scope,
                    targetId,
                    senderId: socket.userId,
                    senderName: userProfile.username || "Member",
                    senderAvatar: userProfile.avatar || "",
                    content
                });

                // 4. Broadcast to the generic room
                const room = `chat:${scope}:${targetId}`;
                io.to(room).emit("chat:message", newMessage);

                logger.info(`Chat message sent by ${maskId(socket.userId)} to ${room}`);
            } catch (error) {
                logger.error(`Error in chat:message for ${scope}:${maskId(targetId)}:`, error.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Disconnect handler
        socket.on("disconnect", (reason) => {
            logger.info(`Client disconnected: ${socket.id} (Reason: ${reason})`);
        });

        // Error handler
        socket.on("error", (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });

    logger.info("Socket.IO server initialized");
    return io;
};

/**
 * Get the Socket.IO instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initializeSocket first.");
    }
    return io;
};

/**
 * Emit event to a specific team room
 */
export const emitToTeam = (teamId, event, data) => {
    if (!io) {
        logger.warn("Socket.IO not initialized. Cannot emit event.");
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        logger.warn(`Invalid teamId for emitToTeam: ${maskId(teamId)}`);
        return;
    }

    io.to(`team:${teamId}`).emit(event, data);
    logger.info(`Emitted ${event} to team:${maskId(teamId)}`);
};

/**
 * Emit event to a specific user room
 */
export const emitToUser = (userId, event, data) => {
    if (!io) {
        logger.warn("Socket.IO not initialized. Cannot emit event.");
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        logger.warn(`Invalid userId for emitToUser: ${maskId(userId)}`);
        return;
    }

    io.to(`user:${userId}`).emit(event, data);
    logger.info(`Emitted ${event} to user:${maskId(userId)}`);
};
