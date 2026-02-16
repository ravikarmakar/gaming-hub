import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import Team from "../../modules/team/team.model.js";
import User from "../../modules/user/user.model.js";
import { logger } from "../utils/logger.js";
import { initializeIORedis } from "./ioredis.js";
import { redis } from "./redis.js";

let io;

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

        // Join team room
        socket.on("join:team", async (teamId) => {
            if (!teamId) return;

            // 1. Validate teamId format to prevent room name injection
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                logger.warn(`Invalid teamId format for join:team: ${maskId(teamId)} from user ${maskId(socket.userId)}`);
                return;
            }

            try {
                const cacheKey = `socket_member:${socket.userId}:${teamId}`;

                // 2. Check Redis cache for membership (avoids DB query on reconnections)
                let isMember = false;
                try {
                    const cached = await redis.get(cacheKey);
                    if (cached === "1" || cached === 1) {
                        isMember = true;
                    }
                } catch (cacheErr) {
                    logger.error(`Redis cache check failed for socket membership:`, cacheErr.message);
                    // Fall through to DB check
                }

                // 3. Fall back to DB if not cached
                if (!isMember) {
                    const dbResult = await Team.exists({
                        _id: teamId,
                        "teamMembers.user": socket.userId,
                        isDeleted: false
                    });

                    if (!dbResult) {
                        logger.warn(`Unauthorized join:team attempt: User ${maskId(socket.userId)} tried to join team ${maskId(teamId)}`);
                        socket.emit("error", { message: "Unauthorized to join this team room" });
                        return;
                    }

                    isMember = true;

                    // Cache the membership for 5 minutes
                    redis.set(cacheKey, "1", { ex: 300 })
                        .catch(err => logger.error(`Failed to cache socket membership:`, err.message));
                }

                socket.join(`team:${teamId}`);
                logger.info(`User ${maskId(socket.userId)} joined team room: ${maskId(teamId)}`);
            } catch (error) {
                logger.error(`Error in join:team for team ${maskId(teamId)}:`, error.message);
            }
        });

        // Leave team room
        socket.on("leave:team", (teamId) => {
            if (!teamId) return;

            // Validate teamId format
            if (!mongoose.Types.ObjectId.isValid(teamId)) return;

            socket.leave(`team:${teamId}`);

            // Invalidate membership cache on explicit leave
            redis.del(`socket_member:${socket.userId}:${teamId}`)
                .catch(err => logger.error(`Failed to invalidate socket membership cache:`, err.message));

            logger.info(`User ${maskId(socket.userId)} left team room: ${maskId(teamId)}`);
        });

        // Chat message handler
        socket.on("chat:message", async (data) => {
            const { teamId, content } = data;
            if (!teamId || !content) return;

            try {
                // 1. Basic validation
                if (!mongoose.Types.ObjectId.isValid(teamId)) return;

                // 2. Fetch user profile from Redis with simple DB fallback
                let userProfile = null;
                try {
                    const cached = await redis.get(`user_profile:${socket.userId}`);
                    if (cached) {
                        userProfile = typeof cached === "string" ? JSON.parse(cached) : cached;
                    }
                } catch (err) {
                    logger.error("Failed to get user profile from Redis for chat:", err.message);
                }

                // fallback to DB if cache miss
                if (!userProfile || !userProfile.username) {
                    try {
                        const user = await User.findById(socket.userId).lean();
                        if (user) {
                            userProfile = user;
                            // Optionally re-cache for 1 min to help performance
                            redis.set(`user_profile:${socket.userId}`, JSON.stringify(user), { ex: 60 })
                                .catch(e => logger.error("Failed to re-cache profile in socket handler:", e.message));
                        }
                    } catch (dbErr) {
                        logger.error("Failed to fetch user profile from DB for chat:", dbErr.message);
                    }
                }

                // 3. Determine sender role in the team
                let senderRole = "member";
                try {
                    const team = await Team.findById(teamId).select("captain teamMembers").lean();
                    if (team) {
                        if (team.captain.toString() === socket.userId.toString()) {
                            senderRole = "owner";
                        } else {
                            const member = team.teamMembers.find(m => m.user.toString() === socket.userId.toString());
                            if (member && member.roleInTeam === "manager") {
                                senderRole = "manager";
                            }
                        }
                    }
                } catch (teamErr) {
                    logger.error("Failed to fetch team for role check in chat:", teamErr.message);
                }

                // 4. Persist message to database
                const newMessage = await (await import("../../modules/chat/chat.model.js")).default.create({
                    team: teamId,
                    sender: socket.userId,
                    senderName: userProfile?.username || "Team Member",
                    senderAvatar: userProfile?.avatar || "",
                    senderRole,
                    content: content.trim().substring(0, 1000),
                });

                // 4. Broadcast to the team room
                io.to(`team:${teamId}`).emit("chat:message", newMessage);

                logger.info(`Chat message sent by ${maskId(socket.userId)} to team ${maskId(teamId)}`);
            } catch (error) {
                logger.error(`Error in chat:message for team ${maskId(teamId)}:`, error.message);
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

    // Validate teamId format before emitting
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        logger.warn(`Invalid teamId for emitToTeam: ${maskId(teamId)}`);
        return;
    }

    io.to(`team:${teamId}`).emit(event, data);
    logger.info(`Emitted ${event} to team:${maskId(teamId)}`);
};
