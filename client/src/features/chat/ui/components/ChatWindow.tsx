import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, LoaderCircle as Loader2, Maximize2 } from "lucide-react";

import { useSocket } from "@/contexts/SocketContext";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useChatStore, ChatMessage } from "../../store/useChatStore";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";

interface ChatWindowProps {
    targetId: string;
    targetName: string;
    scope: "team" | "organizer" | "group" | "user";
    canDeleteParent?: boolean;
    variant?: "window" | "page";
}

export const ChatWindow = ({
    targetId,
    targetName,
    scope,
    canDeleteParent,
    variant = "window"
}: ChatWindowProps) => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();
    const { messages, isLoading, fetchHistory, addMessage, clearMessages } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const isPage = variant === "page";

    useEffect(() => {
        // 1. Fetch chat history
        fetchHistory(targetId, scope);

        // 2. Join generic chat room
        if (socket && isConnected) {
            socket.emit("join:chat", { targetId, scope });

            // 3. Listen for new messages
            socket.on("chat:message", (message: ChatMessage) => {
                if (message.targetId === targetId && message.scope === scope) {
                    addMessage(message);
                }
            });

            socket.on("chat:update", (message: ChatMessage) => {
                useChatStore.getState().handleRemoteUpdate(message);
            });

            socket.on("chat:delete", ({ messageId, targetId: msgTargetId }: { messageId: string, targetId: string }) => {
                if (msgTargetId === targetId) {
                    useChatStore.getState().handleRemoteDelete(messageId);
                }
            });

            return () => {
                socket.off("chat:message");
                socket.off("chat:update");
                socket.off("chat:delete");
                socket.emit("leave:chat", { targetId, scope });
                clearMessages();
            };
        }

        return () => {
            clearMessages();
        };
    }, [targetId, scope, socket, isConnected, fetchHistory, addMessage, clearMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (content: string) => {
        if (socket && isConnected) {
            socket.emit("chat:message", { targetId, scope, content });
        }
    };

    const chatUrl = (scope === "group" || scope === "user") ? null : (scope === "team" ? TEAM_ROUTES.CHAT : ORGANIZER_ROUTES.CHAT);

    if (isLoading && messages.length === 0) {
        return (
            <div className={cn(
                "flex items-center justify-center bg-[#0F111A]/40 border border-white/10 backdrop-blur-xl",
                isPage ? "flex-1 rounded-none border-none" : "h-[500px] rounded-2xl"
            )}>
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                "flex flex-col overflow-hidden",
                isPage ? "flex-1 h-full w-full bg-[#0F111A]/60" : "h-full"
            )}
        >
            {/* Custom Integrated Header */}
            <div className={cn(
                "pb-4 md:pb-6 mb-4 md:mb-6 border-b border-white/10 flex items-center justify-between px-4 md:px-0",
                isPage && "pt-4 md:pt-0"
            )}>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/5">
                        <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                            {targetName} {scope === "organizer" ? "Org Chat" : (scope === "group" ? "Group Chat" : (scope === "user" ? "Chat" : "Team Chat"))}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
                            )} />
                            <span className="text-[10px] md:text-xs text-gray-400">
                                {isConnected ? "Live Chat" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>

                {!isPage && chatUrl && (
                    <Link
                        to={chatUrl}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                        title="Open Full Chat"
                    >
                        <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col w-full px-2 md:px-0">
                <div
                    ref={scrollRef}
                    className="w-full flex-1 overflow-y-auto pr-0 md:pr-2 scrollbar-hide md:scrollbar-thin md:scrollbar-thumb-purple-500/20 md:scrollbar-track-transparent pb-4"
                >
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <MessageSquare className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-gray-400 text-sm italic">Be the first to say something!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    layout
                                >
                                    <MessageItem
                                        message={msg}
                                        isOwnMessage={msg.sender === user?._id}
                                        canDeleteParent={canDeleteParent}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input */}
            <div className="w-full border-t border-white/5 bg-[#0F111A]/20 backdrop-blur-md">
                <MessageInput onSendMessage={handleSendMessage} isLoading={!isConnected} />
            </div>
        </motion.div>
    );
};
