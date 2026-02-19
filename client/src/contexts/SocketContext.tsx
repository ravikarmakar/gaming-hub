import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        // Only connect if user is authenticated
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Initialize socket connection with cookie-based auth
        // Extract base URL from API URL (remove /api/v1 suffix if present)
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
        const serverUrl = apiUrl.replace(/\/api\/v1$/, "");

        const newSocket = io(serverUrl, {
            // Cookies will be sent automatically for authentication
            withCredentials: true,
            auth: {
                // Send userId for additional verification
                token: "cookie-auth", // Placeholder since we use cookies
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        newSocket.on("connect", () => {
            console.log("✅ Socket.IO connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("❌ Socket.IO disconnected:", reason);
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket.IO connection error:", error.message);
            setIsConnected(false);
        });

        // Global User Listeners
        newSocket.on("user:profile_updated", async (data) => {
            console.log("👤 Profile update received:", data);
            // Refresh auth store to get latest teamId and roles
            const { checkAuth } = useAuthStore.getState();
            await checkAuth();
        });

        setSocket(newSocket);

        // Cleanup on unmount or user change
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
