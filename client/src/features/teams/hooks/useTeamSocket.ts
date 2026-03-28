import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { teamKeys } from "./teamKeys";
import { useTeamRoom, useSocketEvent } from "@/hooks/useSocket";
import { TEAM_SOCKET_EVENTS as EVENTS } from "../lib/socketEvents";

export const useTeamSocket = (teamId: string | null | undefined) => {
    const queryClient = useQueryClient();

    const teamIdRef = useRef(teamId);
    useEffect(() => {
        teamIdRef.current = teamId;
    }, [teamId]);

    // Auto-join/leave team room
    useTeamRoom(teamId);

    const invalidateTeam = useCallback(() => {
        if (teamId) {
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
        }
    }, [teamId, queryClient]);

    const invalidateRequests = useCallback(() => {
        if (teamId) {
            queryClient.invalidateQueries({ queryKey: teamKeys.requests(teamId) });
        }
    }, [teamId, queryClient]);

    // Member events
    useSocketEvent(EVENTS.MEMBER_JOINED, (data: any) => {
        toast.success(`${data.username || "A new member"} joined the team!`);
        invalidateTeam();
    });

    useSocketEvent(EVENTS.MEMBER_LEFT, (data: any) => {
        toast(`${data.username || "A member"} left the team.`, { icon: 'ℹ️' });
        invalidateTeam();
    });

    useSocketEvent(EVENTS.ROLE_UPDATED, (data: any) => {
        toast.success(`Roles updated for ${data.username || "a member"}.`);
        invalidateTeam();
    });

    useSocketEvent(EVENTS.OWNER_TRANSFERRED, (data: any) => {
        const newOwnerName = data.newOwnerName || "a new member";
        toast.success(`Team ownership has been transferred to ${newOwnerName}.`);
        invalidateTeam();
    });

    // Team state events
    useSocketEvent(EVENTS.TEAM_UPDATED, () => {
        invalidateTeam();
    });

    useSocketEvent(EVENTS.TEAM_DELETED, () => {
        toast.error("The team has been disbanded.");
        invalidateTeam();
    });

    // Join request events
    useSocketEvent(EVENTS.JOIN_REQUEST_CREATED, (data: any) => {
        const currentTeamId = teamIdRef.current;
        // Only show toast and invalidate if we are looking at the target team
        if (currentTeamId && data.request?.target === currentTeamId) {
            toast.success(`New join request from ${data.request?.requester?.username || "a player"}!`);
            invalidateRequests();
        }
    });

    useSocketEvent(EVENTS.JOIN_REQUEST_HANDLED, (data: any) => {
        const currentTeamId = teamIdRef.current;
        if (currentTeamId && data.teamId === currentTeamId) {
            invalidateRequests();
            invalidateTeam(); // Roster might have changed
        }
    });

    return {
        invalidateTeam,
        invalidateRequests
    };
};
