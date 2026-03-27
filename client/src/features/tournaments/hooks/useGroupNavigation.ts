import { useCallback, useMemo } from 'react';
import { Group } from '../types';

export function useGroupNavigation(
    groups: Group[],
    selectedGroup: Group | null,
    setSelectedGroup: (group: Group | null) => void
) {
    const currentIndex = useMemo(() => 
        selectedGroup ? groups.findIndex(g => g._id === selectedGroup._id) : -1
    , [selectedGroup, groups]);

    const nextGroup = useCallback(() => {
        if (currentIndex === -1 || currentIndex >= groups.length - 1) return;
        setSelectedGroup(groups[currentIndex + 1]);
    }, [currentIndex, groups, setSelectedGroup]);

    const prevGroup = useCallback(() => {
        if (currentIndex <= 0) return;
        setSelectedGroup(groups[currentIndex - 1]);
    }, [currentIndex, groups, setSelectedGroup]);

    const hasNextGroup = currentIndex !== -1 && currentIndex < groups.length - 1;
    const hasPreviousGroup = currentIndex > 0;
    const currentGroupIndex = currentIndex + 1;
    const totalGroupsCount = groups.length;

    return {
        nextGroup,
        prevGroup,
        hasNextGroup,
        hasPreviousGroup,
        currentGroupIndex,
        totalGroupsCount,
    };
}
