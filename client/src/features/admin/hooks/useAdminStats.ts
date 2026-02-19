import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface AdminStats {
    totalUsers: number;
    totalTeams: number;
    totalOrgs: number;
    totalMatches: number;
    activeUsers: number;
}

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;

        // Initialize admin socket
        const adminSocket = io(`${import.meta.env.VITE_API_URL}/admin`, {
            withCredentials: true,
            transports: ["websocket"],
        });

        adminSocket.on("connect", () => {
            console.log("Connected to admin socket");
        });

        adminSocket.on("stats:update", (newStats: AdminStats) => {
            setStats(newStats);
        });

        adminSocket.on("error", (err) => {
            console.error("Admin socket error:", err);
        });

        setSocket(adminSocket);

        return () => {
            adminSocket.disconnect();
        };
    }, [user]);

    return { stats, isConnected: !!socket?.connected };
};
