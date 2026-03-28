import { useState, useCallback } from 'react';
import { useUpdateGroupResultsMutation, useResetGroupMutation } from './useTournamentMutations';
import { LeaguePairingType } from '../types';

export function useGroupResults(eventId: string, selectedGroupId: string | null) {
    const { mutateAsync: updateGroupResults } = useUpdateGroupResultsMutation();
    const { mutateAsync: resetGroup } = useResetGroupMutation();

    const [isResultsMode, setIsResultsMode] = useState(false);
    const [tempResults, setTempResults] = useState<Record<string, { kills: number; rank: number }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [selectedPairing, setSelectedPairing] = useState<LeaguePairingType | null>(null);

    const handleResultChange = useCallback((teamId: string, field: 'kills' | 'rank', value: number) => {
        setTempResults(prev => {
            const current = prev[teamId] || { kills: 0, rank: 0 };
            return {
                ...prev,
                [teamId]: {
                    ...current,
                    [field]: value
                }
            };
        });
    }, []);

    const handleSubmitResults = useCallback(() => {
        setIsConfirmOpen(true);
    }, []);

    const handleConfirmSubmit = useCallback(async () => {
        if (!selectedGroupId || Object.keys(tempResults).length === 0) {
            setIsConfirmOpen(false);
            return;
        }

        const resultsArray = Object.entries(tempResults).map(([teamId, stats]) => ({
            teamId,
            kills: stats.kills || 0,
            rank: stats.rank || 0
        }));

        setIsSaving(true);
        setIsConfirmOpen(false);
        try {
            await updateGroupResults({
                groupId: selectedGroupId,
                eventId,
                results: resultsArray,
                pairingType: selectedPairing ?? undefined,
            });
            setIsResultsMode(false);
            setSelectedPairing(null);
            setTempResults({});
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }, [selectedGroupId, eventId, tempResults, selectedPairing, updateGroupResults]);

    const handleResetGroup = useCallback(() => {
        setIsResetConfirmOpen(true);
    }, []);

    const handleConfirmReset = useCallback(async () => {
        if (!selectedGroupId) {
            setIsResetConfirmOpen(false);
            return;
        }
        setIsSaving(true);
        setIsResetConfirmOpen(false);
        try {
            await resetGroup({ groupId: selectedGroupId, eventId });
            setIsResultsMode(false);
            setSelectedPairing(null);
            setTempResults({});
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }, [selectedGroupId, eventId, resetGroup]);

    return {
        isResultsMode,
        setIsResultsMode,
        tempResults,
        setTempResults,
        isSaving,
        isConfirmOpen,
        setIsConfirmOpen,
        isResetConfirmOpen,
        setIsResetConfirmOpen,
        selectedPairing,
        setSelectedPairing,
        handleResultChange,
        handleSubmitResults,
        handleConfirmSubmit,
        handleResetGroup,
        handleConfirmReset,
    };
}
