import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "../../store/useChatStore";

interface MessageItemProps {
    message: ChatMessage;
    isOwnMessage: boolean;
}

export const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
    return (
        <div
            className={`flex items-start gap-3 mb-4 ${isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
        >
            <Avatar className="w-8 h-8 border border-white/10">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xs">
                    {message.senderName?.substring(0, 2).toUpperCase() || "TM"}
                </AvatarFallback>
            </Avatar>

            <div
                className={`flex flex-col max-w-[80%] ${isOwnMessage ? "items-end" : "items-start"
                    }`}
            >
                <div className="flex items-center gap-2 mb-1">
                    {!isOwnMessage && (
                        <span className="text-xs font-bold text-gray-300">
                            {message.senderName}
                        </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                </div>

                <div
                    className={`px-4 py-2 rounded-2xl text-sm ${isOwnMessage
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-[#1A1D2D] text-gray-200 border border-white/5 rounded-tl-none"
                        }`}
                >
                    {message.content}
                </div>
            </div>
        </div>
    );
};
