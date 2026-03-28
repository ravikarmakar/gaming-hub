import { useState } from "react";
import { format } from "date-fns";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useChatStore, ChatMessage } from "../../store/useChatStore";
import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { cn } from "@/lib/utils";

interface MessageItemProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    canDeleteParent?: boolean; // Admin/Owner can delete
}

export const MessageItem = ({ message, isOwnMessage, canDeleteParent }: MessageItemProps) => {
    const { deleteMessage, setEditingMessage } = useChatStore();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const canDelete = isOwnMessage || canDeleteParent;


    const handleDelete = async () => {
        try {
            await deleteMessage(message._id);
        } catch (error) {
            console.error("Failed to delete message:", error);
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "owner":
                return (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-wider">
                        Owner
                    </span>
                );
            case "manager":
                return (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-wider">
                        Manager
                    </span>
                );
            case "staff":
                return (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider">
                        Staff
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div
                className={cn(
                    "group flex items-start gap-3 mb-2",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                )}
            >
                <Avatar className="w-7 h-7 border border-white/10 mt-1 shrink-0">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[10px]">
                        {message.senderName?.substring(0, 2).toUpperCase() || "TM"}
                    </AvatarFallback>
                </Avatar>

                <div className={cn(
                    "flex flex-col min-w-0 max-w-[90%] md:max-w-[85%] w-fit",
                    isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                    {isOwnMessage ? (
                        <div className="flex items-center gap-2 mr-2 mb-0.5">
                            {getRoleBadge(message.senderRole)}
                            <span className="text-[10px] font-bold text-gray-400">
                                You
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 ml-2 mb-0.5">
                            <span className="text-[10px] font-bold text-gray-400">
                                {message.senderName}
                            </span>
                            {getRoleBadge(message.senderRole)}
                        </div>
                    )}

                    <div className="relative group/bubble flex items-end gap-1">
                        {/* Action Menu - Dropdown for mobile/desktop accessibility */}
                        {(canDelete || isOwnMessage) && (
                            <div className={cn(
                                "opacity-0 group-hover/bubble:opacity-100 transition-opacity mb-1",
                                isOwnMessage ? "order-first" : "order-last"
                            )}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isOwnMessage ? "end" : "start"} className="bg-[#1A1D2D] border-white/10 text-gray-200">
                                        {isOwnMessage && (
                                            <DropdownMenuItem
                                                onClick={() => setEditingMessage(message)}
                                                className="gap-2 focus:bg-white/5 focus:text-white"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                        )}
                                        {canDelete && (
                                            <DropdownMenuItem
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        <div
                            className={cn(
                                "relative px-4 py-2 rounded-2xl text-[13px] leading-relaxed break-all shadow-lg transition-all duration-300 w-fit",
                                isOwnMessage
                                    ? "bg-[#2E1065] text-white border border-purple-500/10 rounded-tr-none shadow-purple-950/20"
                                    : "bg-[#1A1D2D] text-gray-200 border border-white/5 rounded-tl-none shadow-black/20"
                            )}
                        >
                            <div className="flex flex-wrap items-end justify-end gap-x-4 gap-y-1 min-w-0">
                                <div className="flex-1 whitespace-pre-wrap">
                                    {message.content}
                                    {message.isEdited && (
                                        <span className="text-[9px] opacity-40 ml-1 italic">(edited)</span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-medium opacity-60 uppercase whitespace-nowrap mb-0.5",
                                    isOwnMessage ? "text-purple-100" : "text-gray-400"
                                )}>
                                    {format(new Date(message.createdAt), "h:mm aa")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmActionDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Message?"
                description="This action cannot be undone. This will permanently delete this message from the chat."
                actionLabel="Delete Message"
                onConfirm={handleDelete}
                variant="danger"
            />
        </>
    );
};
