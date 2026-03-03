import { Trash2, AlertTriangle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DangerZoneProps {
    orgName?: string;
    onDelete: () => void;
    isDeleting: boolean;
}

export const DangerZone = ({ orgName, onDelete, isDeleting }: DangerZoneProps) => {
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

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            className="bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white font-black px-8"
                        >
                            Terminate Organization
                            <Trash2 className="size-4 ml-2" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#0F0720] border-red-500/20 text-white shadow-2xl max-w-lg">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black text-red-400">Irreversible Action</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400 py-2">
                                You are about to dissolve <span className="text-white font-bold bg-white/5 px-2 py-1 rounded">"{orgName}"</span>.
                                This will permanently erase all history, events, and rosters associated with this organization.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3 mt-4">
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold">Abandon</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-black px-10"
                            >
                                {isDeleting ? "Dissolving..." : "Dissolve Now"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
};
