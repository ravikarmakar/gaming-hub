import { DangerZone as SharedDangerZone } from "@/components/shared/DangerZone";
import { Trash2, AlertTriangle } from "lucide-react";

interface DangerZoneProps {
    orgName?: string;
    onDelete: () => void;
    isDeleting: boolean;
}

export const DangerZone = ({ orgName, onDelete, isDeleting }: DangerZoneProps) => {
    return (
        <SharedDangerZone
            title="Account Safety"
            description="Permanently dissolve your organization and remove its presence."
            icon={AlertTriangle}
            warningContent={
                <>
                    <strong className="text-red-400">Warning:</strong> Dissolving this organization will terminate all hosted events, revoke staff credentials, and purge your metrics. This metadata cannot be recovered.
                </>
            }
            buttonText="Terminate Organization"
            buttonIcon={Trash2}
            dialogTitle="Terminate Organization"
            dialogDescription={
                <>
                    You are about to dissolve <span className="text-white font-bold bg-white/5 px-2 py-1 rounded">"{orgName || 'this organization'}"</span>.
                    This will permanently erase all history, events, and rosters associated with this organization.
                </>
            }
            dialogConfirmLabel={isDeleting ? "Dissolving..." : "Dissolve Now"}
            onConfirm={onDelete}
            isLoading={isDeleting}
        />
    );
};

