import { LoaderCircle as Loader2, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmitResultsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matchesPlayed: number;
    effectiveTotalMatch: number;
    onConfirm: () => void;
    isSaving: boolean;
}

export const SubmitResultsDialog = ({
    open,
    onOpenChange,
    matchesPlayed,
    effectiveTotalMatch,
    onConfirm,
    isSaving
}: SubmitResultsDialogProps) => {
    const isFinalMatch = matchesPlayed + 1 >= effectiveTotalMatch;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#1a1625] border-white/5 text-white">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center tracking-tight">
                        {isFinalMatch ? "Final Submission" : "Submit Results"}
                    </DialogTitle>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <p className="text-gray-400 text-sm leading-relaxed text-center">
                            Are you sure about these results for <span className="text-white font-bold">Match {matchesPlayed + 1}</span> of {effectiveTotalMatch}?
                        </p>
                        {isFinalMatch ? (
                            <p className="text-amber-500/80 text-[11px] font-bold uppercase tracking-widest text-center">
                                Final Match: Results will be locked
                            </p>
                        ) : (
                            <p className="text-blue-400/80 text-[11px] font-bold uppercase tracking-widest text-center">
                                Match {matchesPlayed + 1} of {effectiveTotalMatch}
                            </p>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-200/60 leading-tight">
                            <span className="text-red-400 font-bold block mb-1">PLATFORM RULE</span>
                            Results cannot be edited once submitted. Please double-check all ranks and kill counts before confirming.
                        </p>
                    </div>
                </div>

                <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="bg-white/5 hover:bg-white/10 text-gray-400"
                    >
                        Review Again
                    </Button>
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        onClick={onConfirm}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
