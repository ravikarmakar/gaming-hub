import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";

/**
 * Custom hook to listen for Socket.IO events
 */
export const useSocketEvent = <T = any>(
    event: string,
    callback: (data: T) => void
) => {
    const { socket } = useSocket();
    const callbackRef = useRef(callback);

    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!socket) return;

        const handler = (data: T) => {
            callbackRef.current(data);
        };

        socket.on(event, handler);

        return () => {
            socket.off(event, handler);
        };
    }, [socket, event]);
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

        // Leave room on unmount
        return () => {
            socket.emit("leave:team", teamId);
        };
    }, [socket, teamId, isConnected]);
};

/**
 * Custom hook to join/leave an organizer room
 */
export const useOrgRoom = (orgId: string | null | undefined) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !orgId || !isConnected) return;

        // Join org room
        socket.emit("join:org", orgId);

        // Leave room on unmount
        return () => {
            socket.emit("leave:org", orgId);
        };
    }, [socket, orgId, isConnected]);
};
