import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

interface TeamInviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    playerId: string;
    playerName: string;
}

export const TeamInviteDialog: React.FC<TeamInviteDialogProps> = ({
    open,
    onOpenChange,
    playerId,
    playerName,
}) => {
    const [message, setMessage] = useState("");
    const { inviteMember, isLoading } = useTeamStore();

    const handleInvite = async () => {
        const result = await inviteMember(playerId, message);
        if (result.success) {
            toast.success(result.message || `Invitation sent to ${playerName}`);
            onOpenChange(false);
            setMessage("");
        } else {
            toast.error(result.message || "Failed to send invitation");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#0d091a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight italic">
                        Recruit Operative
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                        Send a tactical invitation to <span className="text-violet-400 font-bold">{playerName}</span> to join your squad.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            Tactical Message (Optional)
                        </label>
                        <Textarea
                            placeholder="Briefly explain why they should join your team..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-violet-500/50 min-h-[100px] resize-none text-sm"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-white/5 text-white/50"
                    >
                        Abort
                    </Button>
                    <Button
                        onClick={handleInvite}
                        disabled={isLoading}
                        className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest italic">
                            Send Invite
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
