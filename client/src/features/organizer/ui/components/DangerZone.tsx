import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

interface DangerZoneProps {
    orgName?: string;
    onDelete: () => void;
    isDeleting: boolean;
}

export const DangerZone = ({ orgName, onDelete, isDeleting }: DangerZoneProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <Card className="border-red-500/20 bg-red-500/5 shadow-inner">
            <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="size-5" /> Account Safety
                </CardTitle>
                <CardDescription className="text-red-400/60 font-medium">
                    Permanently dissolve your organization and remove its presence.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-red-300/60 mb-6 leading-relaxed bg-red-950/20 p-4 rounded-lg border border-red-500/10">
                    <strong className="text-red-400">Warning:</strong> Dissolving this organization will terminate all hosted events, revoke staff credentials, and purge your metrics. This metadata cannot be recovered.
                </p>

                <ConfirmActionDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title="Terminate Organization"
                    description={
                        <>
                            You are about to dissolve <span className="text-white font-bold bg-white/5 px-2 py-1 rounded">"{orgName}"</span>.
                            This will permanently erase all history, events, and rosters associated with this organization.
                        </>
                    }
                    actionLabel={isDeleting ? "Dissolving..." : "Dissolve Now"}
                    onConfirm={onDelete}
                    isLoading={isDeleting}
                    variant="danger"
                />

                <Button
                    variant="destructive"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isDeleting}
                    className="bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white font-black px-8"
                >
                    Terminate Organization
                    <Trash2 className="size-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    );
};
