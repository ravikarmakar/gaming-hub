import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/lib/api-helper';
import { tournamentKeys } from './useTournamentQueries';
import toast from 'react-hot-toast'; // Assuming toast is used for error/success reporting in UI normally handled by components, but we'll return promises so components can handle it
import { tournamentApi } from '../api/tournamentApi';

// TOURNAMENT MUTATIONS
export const useCreateTournamentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.createTournament,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            // Success handled by component
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to create tournament"));
        }
    });
};

export const useUpdateTournamentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.updateTournament,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.details(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            // Invalidate all org queries globally since we don't have orgId
            queryClient.invalidateQueries({ queryKey: ['tournaments', 'org'] });
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to update tournament"));
        }
    });
};

export const useDeleteTournamentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.deleteTournament,
        onSuccess: () => {
            // Let component handle navigation/success message
            // but we might want to invalidate event lists if they are queried via rtk
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to delete tournament"));
        }
    });
};

export const useStartTournamentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.startTournament,
        onSuccess: (data, eventId) => {
            // Update the specific tournament details query cache immediately
            queryClient.setQueryData(tournamentKeys.details(eventId), data);

            // Still invalidate to be safe, but setQueryData provides immediate UI update
            queryClient.invalidateQueries({ queryKey: tournamentKeys.details(eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Event started");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to start event"));
        }
    });
};


// ROUND MUTATIONS
export const useCreateRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.createRound,
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
        mutationFn: tournamentApi.updateRound,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: [...tournamentKeys.all, 'leaderboard'] });
            queryClient.invalidateQueries({ queryKey: [...tournamentKeys.all, 'groups'] });
            toast.success("Round updated successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to update round"));
        }
    });
};

export const useUpdateRoundStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.updateRoundStatus,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.details(variables.eventId) });
            toast.success("Round status updated");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to update round status"));
        }
    });
};

export const useDeleteRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.deleteRound,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            // Invalidate groups as well since deleting a round removes its groups context
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groups(variables.roundId, 1, 20) });
            toast.success("Round deleted successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to delete round"));
        }
    });
};

export const useResetRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.resetRound,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Round reset successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to reset round"));
        }
    });
};

// GROUP MUTATIONS
export const useCreateGroupsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.createGroups,
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
        mutationFn: tournamentApi.updateGroup,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groupDetails(variables.groupId) });
            // Invalidate all groups to ensure lists are updated
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to update group"));
        }
    });
};

export const useCreateSingleGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.createSingleGroup,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Group created successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to create group"));
        }
    });
};

export const useInviteToGroupMutation = () => {
    return useMutation({
        mutationFn: tournamentApi.inviteToGroup,
        onSuccess: () => {
            toast.success("Invitation sent successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to send invitation"));
        }
    });
};

// LEADERBOARD MUTATIONS
export const useUpdateTeamScoreMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.updateTeamScore,
        onMutate: async (variables) => {
            const { groupId, teamId, stats } = variables;
            await queryClient.cancelQueries({ queryKey: tournamentKeys.leaderboard(groupId) });
            const previousLeaderboard = queryClient.getQueryData(tournamentKeys.leaderboard(groupId));

            queryClient.setQueryData(tournamentKeys.leaderboard(groupId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    leaderboard: old.leaderboard?.map((entry: any) =>
                        entry.teamId?._id === teamId || entry.teamId === teamId
                            ? { ...entry, ...stats }
                            : entry
                    )
                };
            });

            return { previousLeaderboard };
        },
        onError: (err, variables, context) => {
            if (context?.previousLeaderboard) {
                queryClient.setQueryData(tournamentKeys.leaderboard(variables.groupId), context.previousLeaderboard);
            }
            toast.error(handleApiError(err, "Failed to update team score"));
        },
        onSuccess: () => {
            toast.success("Team score updated");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(variables.groupId) });
        },
    });
};

export const useUpdateGroupResultsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.updateGroupResults,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groupDetails(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Results submitted successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to submit results"));
        }
    });
};

export const useDeleteGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.deleteGroup,
        onSuccess: (data, variables) => {
            toast.success(data.message || "Group deleted!");
            queryClient.invalidateQueries({ queryKey: [...tournamentKeys.all, 'groups'] });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete group");
        }
    });
};

export const useInjectTeamMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.injectTeam,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Team injected successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to inject team"));
        }
    });
};

export const useMergeTeamsToRoundMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.mergeTeamsToRound,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.rounds(variables.eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success("Teams merged successfully from other roadmaps");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to merge teams"));
        }
    });
};

export const useMergeTeamsToGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.mergeTeamsToGroup,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: tournamentKeys.groupDetails(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.leaderboard(variables.groupId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success(data.message || "Teams merged successfully");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Failed to merge teams into group"));
        }
    });
};

export const useLikeTournamentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId: string) => tournamentApi.toggleLike(eventId),
        onMutate: async (eventId) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: tournamentKeys.details(eventId) });

            // Snapshot the previous value
            const previousTournament = queryClient.getQueryData(tournamentKeys.details(eventId));

            // Optimistically update to the new value
            queryClient.setQueryData(tournamentKeys.details(eventId), (old: any) => {
                if (!old) return old;
                // Since this is a toggle, we simulate the change
                const isLiked = !old.isLiked;
                return {
                    ...old,
                    isLiked,
                    likes: isLiked ? (old.likes || 0) + 1 : Math.max(0, (old.likes || 1) - 1)
                };
            });

            // Return a context object with the snapshotted value
            return { previousTournament };
        },
        onError: (err, eventId, context) => {
            // Rollback to the previous value if the mutation fails
            if (context?.previousTournament) {
                queryClient.setQueryData(tournamentKeys.details(eventId), context.previousTournament);
            }
            toast.error(handleApiError(err, "Failed to toggle like"));
        },
        onSuccess: (data, eventId) => {
            // Update the specific tournament details query cache with official data
            queryClient.setQueryData(tournamentKeys.details(eventId), (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    likes: data.likesCount,
                    isLiked: data.isLiked
                };
            });
        },
        onSettled: (_data, _error, eventId) => {
            // Always refetch after error or success to ensure we are in sync with the server
            queryClient.invalidateQueries({ queryKey: tournamentKeys.details(eventId) });
        },
    });
};

export const useRegisterTournamentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tournamentApi.registerTournament,
        onSuccess: (data, eventId) => {
            queryClient.invalidateQueries({ queryKey: [...tournamentKeys.all, 'registration-status', eventId] });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.details(eventId) });
            queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
            toast.success(data.message || "Successfully deployed to arena!");
        },
        onError: (err) => {
            toast.error(handleApiError(err, "Deployment failed. Request backup."));
        }
    });
};
