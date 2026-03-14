import { Trophy, Info } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Round } from "../../../hooks";

interface RoundInfoDialogProps {
    round: Round | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const RoundInfoDialog = ({ round, open, onOpenChange }: RoundInfoDialogProps) => {
    if (!round) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        Round Information
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Configuration details and qualification criteria for {round.roundName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="bg-white/5 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Start Date</span>
                        <div className="font-medium text-white">
                            {round.startTime ? formatDate(round.startTime) : 'Not scheduled'}
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Daily Window</span>
                        <div className="font-medium text-white">
                            {round.dailyStartTime || "13:00"} - {round.dailyEndTime || "21:00"}
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Gap Between Matches</span>
                        <div className="font-medium text-white">
                            {round.gapMinutes || 0} Minutes
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Total Groups</span>
                        <div className="font-bold text-lg text-white">
                            {(round.groups || []).length} Groups
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Total Teams</span>
                        <div className="font-bold text-lg text-white">
                            {(round.groups || []).reduce((acc, g) => acc + (g.teams?.length || 0), 0)} Teams
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Matches / Group</span>
                        <div className="font-medium text-white">
                            {round.matchesPerGroup || 1} Matches
                        </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg space-y-1">
                        <span className="text-xs text-purple-300 uppercase tracking-wider flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Qualification
                        </span>
                        <div className="font-bold text-lg text-white">
                            Top {round.qualifyingTeams ?? "N/A"} Teams
                        </div>
                        <p className="text-xs text-purple-300/70">
                            Advance to the next round based on total points.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full bg-white/10 hover:bg-white/20 text-white">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
