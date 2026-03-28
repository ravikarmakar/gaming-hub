import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type TeamDialogType =
    | 'createTeam'
    | 'disbandTeam'
    | 'removeMember'
    | 'promoteMember'
    | 'demoteMember'
    | 'transferOwnership'
    | 'updateMemberRole'
    | 'leaveTeam'
    | 'inviteMember'
    | 'clearJoinRequests'
    | 'rejectJoinRequest';

interface TeamDialogContextType {
    activeDialog: TeamDialogType | null;
    dialogData: any;
    openDialog: (type: TeamDialogType, data?: any) => void;
    closeDialog: () => void;
    isOpen: (type: TeamDialogType) => boolean;
}

const TeamDialogContext = createContext<TeamDialogContextType | undefined>(undefined);

export const TeamDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeDialog, setActiveDialog] = useState<TeamDialogType | null>(null);
    const [dialogData, setDialogData] = useState<any>(null);

    const openDialog = useCallback((type: TeamDialogType, data: any = null) => {
        setActiveDialog(type);
        setDialogData(data);
    }, []);

    const closeDialog = useCallback(() => {
        setActiveDialog(null);
        setDialogData(null);
    }, []);

    const isOpen = useCallback((type: TeamDialogType) => activeDialog === type, [activeDialog]);

    return (
        <TeamDialogContext.Provider value={{ activeDialog, dialogData, openDialog, closeDialog, isOpen }}>
            {children}
        </TeamDialogContext.Provider>
    );
};

export const useTeamDialogs = () => {
    const context = useContext(TeamDialogContext);
    if (context === undefined) {
        throw new Error('useTeamDialogs must be used within a TeamDialogProvider');
    }
    return context;
};
