import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

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

    // Use a SELECTOR to only subscribe to the user's _id, NOT the full user object.
    // This prevents the entire SocketProvider (and all its children) from re-rendering
    // every time any user property changes (e.g., roles, XP, avatar).
    const userId = useAuthStore((state) => state.user?._id);

    const queryClient = useQueryClient();
    const hasConnected = useRef(false);
    const profileRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced profile refresh to coalesce rapid-fire profile_updated events
    const debouncedCheckAuth = useCallback(() => {
        if (profileRefreshTimer.current) {
            clearTimeout(profileRefreshTimer.current);
        }
        profileRefreshTimer.current = setTimeout(() => {
            const { checkAuth } = useAuthStore.getState();
            checkAuth(true);
            profileRefreshTimer.current = null;
        }, 300); // Wait 300ms for events to settle before refreshing
    }, []);

    useEffect(() => {
        // Only connect if user is authenticated
        if (!userId) {
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
            setIsConnected(true);

            // Failure Mode Scenario B: Resync state on reconnection to fix missed events
            if (hasConnected.current) {
                queryClient.invalidateQueries({ refetchType: 'active' });
            }
            hasConnected.current = true;
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket.IO connection error:", error.message);
            setIsConnected(false);
        });

        // Global User Listeners — debounced to prevent thundering herd
        newSocket.on("user:profile_updated", () => {
            debouncedCheckAuth();
        });

        setSocket(newSocket);

        // Cleanup on unmount or user identity change
        return () => {
            if (profileRefreshTimer.current) {
                clearTimeout(profileRefreshTimer.current);
            }
            newSocket.disconnect();
        };
    }, [userId]); // Only reconnect if user identity changes (login/logout)

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
