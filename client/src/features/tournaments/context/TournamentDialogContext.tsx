import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type TournamentDialogType =
    | 'createRound'
    | 'editRound'
    | 'resetRound'
    | 'deleteRound'
    | 'roundInfo'
    | 'editGroup'
    | 'deleteGroup'
    | 'groupChat'
    | 'addTeam'
    | 'submitResults'
    | 'mergeTeamsFromPrevious'
    | 'mergeTeamToGroup'
    | 'confirmGroups'
    | 'confirmManual'
    | 'startTournament'
    | 'deleteTournament'
    | 'editTournament';

interface TournamentDialogContextType {
    activeDialog: TournamentDialogType | null;
    dialogData: any;
    openDialog: (type: TournamentDialogType, data?: any) => void;
    closeDialog: () => void;
    isOpen: (type: TournamentDialogType) => boolean;
}

const TournamentDialogContext = createContext<TournamentDialogContextType | undefined>(undefined);

export const TournamentDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeDialog, setActiveDialog] = useState<TournamentDialogType | null>(null);
    const [dialogData, setDialogData] = useState<any>(null);

    const openDialog = useCallback((type: TournamentDialogType, data: any = null) => {
        setActiveDialog(type);
        setDialogData(data);
    }, []);

    const closeDialog = useCallback(() => {
        setActiveDialog(null);
        setDialogData(null);
    }, []);

    const isOpen = useCallback((type: TournamentDialogType) => activeDialog === type, [activeDialog]);

    return (
        <TournamentDialogContext.Provider value={{ activeDialog, dialogData, openDialog, closeDialog, isOpen }}>
            {children}
        </TournamentDialogContext.Provider>
    );
};

export const useTournamentDialogs = () => {
    const context = useContext(TournamentDialogContext);
    if (context === undefined) {
        throw new Error('useTournamentDialogs must be used within a TournamentDialogProvider');
    }
    return context;
};
