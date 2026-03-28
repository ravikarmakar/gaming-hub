import React from 'react';
import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";

interface TournamentOperationsDialogsProps {
    // Delete Tournament
    isDeleteOpen: boolean;
    setIsDeleteOpen: (open: boolean) => void;
    isDeleting: boolean;
    handleDelete: () => Promise<void>;
    
    // Start Tournament
    isStartOpen: boolean;
    setIsStartOpen: (open: boolean) => void;
    isStarting: boolean;
    handleStart: () => Promise<void>;
    
    // Metadata
    tournamentTitle: string;
    eventType?: string;
}

/**
 * TournamentOperationsDialogs handles high-level tournament actions
 * like starting or deleting the entire tournament.
 */
export const TournamentOperationsDialogs: React.FC<TournamentOperationsDialogsProps> = ({
    isDeleteOpen,
    setIsDeleteOpen,
    isDeleting,
    handleDelete,
    isStartOpen,
    setIsStartOpen,
    isStarting,
    handleStart,
    tournamentTitle,
    eventType
}) => {
    return (
        <>
            {/* Delete Confirmation */}
            <ConfirmActionDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Tournament"
                description={
                    <div className="space-y-3">
                        <p>
                            Are you sure you want to delete <span className="text-white font-bold">{tournamentTitle}</span>?
                        </p>
                        <p className="text-sm text-gray-500">
                            This action cannot be undone and all associated data, including rounds, groups, and results, will be permanently removed.
                        </p>
                    </div>
                }
                actionLabel="Delete Tournament"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDelete}
            />

            {/* Start Confirmation */}
            <ConfirmActionDialog
                open={isStartOpen}
                onOpenChange={setIsStartOpen}
                title={eventType === "scrims" ? "Start Scrim" : "Start Tournament"}
                description={
                    <div className="space-y-3">
                        <p>
                            Are you sure you want to start this <span className="text-white font-bold">{eventType === "scrims" ? "scrim" : "tournament"}</span>?
                        </p>
                        <p className="text-sm text-gray-500">
                            This will close registrations and move the event to the <span className="text-purple-400 font-bold uppercase">ongoing</span> state. This action cannot be undone.
                        </p>
                    </div>
                }
                actionLabel={eventType === "scrims" ? "Start Scrim" : "Start Tournament"}
                variant="default"
                isLoading={isStarting}
                onConfirm={handleStart}
            />
        </>
    );
};
