import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatWindow } from "@/features/chat/ui/components/ChatWindow";
import { MessageSquare } from "lucide-react";

interface GroupChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string | null;
    groupName: string;
}

export const GroupChatDialog = ({ open, onOpenChange, groupId, groupName }: GroupChatDialogProps) => {
    if (!groupId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[600px] bg-[#0F111A] border-white/10 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-white/10 flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        {groupName} - Group Chat
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden p-4">
                    <ChatWindow 
                        targetId={groupId} 
                        targetName={groupName} 
                        scope="group" 
                        variant="window"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
