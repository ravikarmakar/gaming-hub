import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./auth-keys";
import { AUTH_ROUTES } from "../lib/routes";

const AUTH_CHANNEL_NAME = "auth_channel";
const LOGOUT_EVENT = "logout_instantly";

/**
 * 10/10 Zero-Latency Cross-Tab Synchronization.
 * Ensures that logging out in one tab instantly closes the session in ALL other tabs.
 */
export function useSessionSync() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);

        channel.onmessage = (event) => {
            if (event.data === LOGOUT_EVENT) {
                // Instantly clear local auth state
                queryClient.setQueryData(authKeys.profile(false), null);
                queryClient.setQueryData(authKeys.profile(true), null);
                queryClient.clear();

                // Trigger a full page reload or redirect if needed via standard React state
                window.location.href = AUTH_ROUTES.LOGIN;
            }
        };

        return () => channel.close();
    }, [queryClient]);
}

/**
 * Utility to broadcast logout globally across the same domain.
 */
export function broadcastLogout() {
    try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage(LOGOUT_EVENT);
        channel.close();
    } catch (error) {
        console.error("Failed to broadcast logout:", error);
    }
}
