import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { handleApiError } from '@/lib/api-helper';
import { tournamentKeys } from './useTournamentQueries';
import toast from 'react-hot-toast'; // Assuming toast is used for error/success reporting in UI normally handled by components, but we'll return promises so components can handle it
import { tournamentApi } from '../api/tournamentApi';

// ROUND MUTATIONS
export const useCreateRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { eventId: string; params: any }) => {
            const res = await axiosInstance.post("/rounds/create", {
                eventId: data.eventId,
                ...data.params
            });
            return res.data.rounds;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            toast.success("Round created successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to create round"));
        }
    });
};

export const useUpdateRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { roundId: string; eventId: string; roundName: string }) => {
            await axiosInstance.put(`/rounds/${data.roundId}`, { eventId: data.eventId, roundName: data.roundName });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            toast.success("Round updated successfully");
        }
    });
};

export const useUpdateRoundStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { roundId: string; eventId: string; status: "pending" | "ongoing" | "completed" }) => {
            await axiosInstance.put(`/rounds/${data.roundId}`, { eventId: data.eventId, status: data.status });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            toast.success("Round status updated");
        }
    });
};

export const useDeleteRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { roundId: string; eventId: string }) => {
            await axiosInstance.delete(`/rounds/${data.roundId}`, { data: { eventId: data.eventId } });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            // Invalidate groups as well since deleting a round removes its groups context
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groups(variables.roundId, 1, 20) });
            toast.success("Round deleted successfully");
        }
    });
};

// GROUP MUTATIONS
export const useCreateGroupsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { roundId: string; eventId: string; totalMatch?: number; matchTime?: string }) => {
            await axiosInstance.post("/groups/create", {
                roundId: data.roundId,
                eventId: data.eventId,
                totalMatch: data.totalMatch || 1,
                matchTime: data.matchTime
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            // Need to invalidate specific pages or all groups for this round
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Groups created successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to create groups"));
        }
    });
};

export const useUpdateGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { groupId: string; eventId: string; payload: any }) => {
            await axiosInstance.put(`/groups/${data.groupId}`, { ...data.payload, eventId: data.eventId });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groupDetails(variables.groupId) });
            // Invalidate all groups to ensure lists are updated
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Group updated successfully");
        }
    });
};

// TOURNAMENT MUTATIONS
export const useStartTournamentMutation = () => {
    return useMutation({
        mutationFn: async (eventId: string) => {
            await axiosInstance.post(`/events/${eventId}/start`);
        },
        onSuccess: () => {
            toast.success("Event started");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to start event"));
        }
    });
};

export const useFinishEventMutation = () => {
    return useMutation({
        mutationFn: async (eventId: string) => {
            await axiosInstance.post(`/events/${eventId}/finish`);
        },
        onSuccess: () => {
            toast.success("Event finished");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to finish event"));
        }
    });
};

// LEADERBOARD MUTATIONS
export const useUpdateTeamScoreMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { groupId: string; eventId: string; teamId: string; stats: any }) => {
            const res = await axiosInstance.put(`/leaderboards/${data.groupId}/score`, {
                teamId: data.teamId,
                eventId: data.eventId,
                ...data.stats,
            });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(variables.groupId) });
            toast.success("Team score updated");
        }
    });
};

export const useUpdateGroupResultsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { groupId: string; eventId: string; results: any[] }) => {
            const res = await axiosInstance.put(`/leaderboards/${data.groupId}/results`, { results: data.results, eventId: data.eventId });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groupDetails(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Results submitted successfully");
        }
    });
};

export const useCreateTournamentMutation = () => {
    return useMutation({
        mutationFn: tournamentApi.createTournament,
        onSuccess: () => {
            // Success handled by component
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to create tournament"));
        }
    });
};

export const useUpdateTournamentMutation = () => {
    return useMutation({
        // mutationFn: tournamentApi.updateTournament,
        onSuccess: () => {
            // Success handled by component
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to update tournament"));
        }
    });
};
