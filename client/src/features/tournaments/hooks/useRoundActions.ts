import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
    useUpdateRoundStatusMutation, 
    useCreateGroupsMutation, 
    useCreateSingleGroupMutation 
} from './useTournamentMutations';
import toast from "react-hot-toast";

export const useRoundActions = (eventId: string, rounds: any[], activeRoundTab: string) => {
    const { mutateAsync: updateRoundStatus } = useUpdateRoundStatusMutation();
    const { mutateAsync: createGroups, isPending: isCreatingGroups } = useCreateGroupsMutation();
    const { mutateAsync: createSingleGroup, isPending: isCreatingSingleGroup } = useCreateSingleGroupMutation();
    const queryClient = useQueryClient();

    const [isCreateRoundOpen, setIsCreateRoundOpen] = useState(false);
    const [isEditRoundOpen, setIsEditRoundOpen] = useState(false);
    const [isResetRoundOpen, setIsResetRoundOpen] = useState(false);
    const [actionRound, setActionRound] = useState<any>(null);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [isConfirmGroupsOpen, setIsConfirmGroupsOpen] = useState(false);
    const [isConfirmManualGroupOpen, setIsConfirmManualGroupOpen] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Refresh Cooldown Effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleRefresh = useCallback((refetchFns: (() => void)[], roundId?: string) => {
        if (cooldown > 0) return;
        
        // 1. Run local refetch functions (usually rounds and event details)
        refetchFns.forEach(fn => fn());

        // 2. Invalidate groups for the current round to force a refresh in GroupsGrid
        if (roundId) {
            queryClient.invalidateQueries({
                queryKey: ['tournaments', 'groups', roundId]
            });
        }

        setCooldown(30);
        toast.success("Data refreshed!");
    }, [cooldown, queryClient]);

    const isGrandFinale = useMemo(() => {
        const latestActual = rounds.filter(r => (r.type || "tournament") === activeRoundTab).pop();
        return latestActual?.groups && latestActual.groups.length === 1;
    }, [rounds, activeRoundTab]);

    const handleCreateGroups = useCallback(async (roundId: string) => {
        try {
            await createGroups({ roundId, eventId });
            toast.success("Groups generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate groups.");
        }
    }, [eventId, createGroups]);

    const handleManualCreateGroup = useCallback(async (roundId: string) => {
        try {
            await createSingleGroup({ roundId, eventId });
            toast.success("Group created successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create group.");
        }
    }, [eventId, createSingleGroup]);

    const handleCompleteRound = useCallback(async (round: any) => {
        if (!round) return;
        setIsSavingStatus(true);
        try {
            await updateRoundStatus({ roundId: round._id, eventId, status: 'completed' });
            toast.success(`${round.roundName} marked as completed!`);
            if (isGrandFinale) {
                toast.success("Grand Finale completed! You can now finish the tournament.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete round.");
        } finally {
            setIsSavingStatus(false);
        }
    }, [eventId, updateRoundStatus, isGrandFinale]);

    return {
        isCreateRoundOpen,
        setIsCreateRoundOpen,
        isEditRoundOpen,
        setIsEditRoundOpen,
        isResetRoundOpen,
        setIsResetRoundOpen,
        actionRound,
        setActionRound,
        isSavingStatus,
        isConfirmGroupsOpen,
        setIsConfirmGroupsOpen,
        isConfirmManualGroupOpen,
        setIsConfirmManualGroupOpen,
        cooldown,
        handleRefresh,
        handleCreateGroups,
        handleManualCreateGroup,
        handleCompleteRound,
        isCreatingGroups,
        isCreatingSingleGroup
    };
};
