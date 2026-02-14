import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";

/**
 * Custom hook to listen for Socket.IO events
 */
export const useSocketEvent = <T = any>(
    event: string,
    callback: (data: T) => void
) => {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Wrap callback to ensure we use the latest version
        const handler = (data: T) => {
            callback(data);
        };

        socket.on(event, handler);

        return () => {
            socket.off(event, handler);
        };
    }, [socket, event, callback]);
};

/**
 * Custom hook to join/leave a team room
 */
export const useTeamRoom = (teamId: string | null | undefined) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !teamId || !isConnected) return;

        // Join team room
        socket.emit("join:team", teamId);
        console.log(`📡 Joined team room: ${teamId}`);

        // Leave room on unmount
        return () => {
            socket.emit("leave:team", teamId);
            console.log(`📤 Left team room: ${teamId}`);
        };
    }, [socket, teamId, isConnected]);
};
