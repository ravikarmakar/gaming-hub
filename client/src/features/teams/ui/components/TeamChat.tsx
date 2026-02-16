import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useChatStore, ChatMessage } from "../../store/useChatStore";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";

interface TeamChatProps {
    teamId: string;
    teamName: string;
}

export const TeamChat = ({ teamId, teamName }: TeamChatProps) => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuthStore();
    const { messages, isLoading, fetchHistory, addMessage } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Fetch chat history
        fetchHistory(teamId);

        // 2. Join team room
        if (socket && isConnected) {
            socket.emit("join:team", teamId);

            // 3. Listen for new messages
            socket.on("chat:message", (message: ChatMessage) => {
                addMessage(message);
            });

            return () => {
                socket.off("chat:message");
                socket.emit("leave:team", teamId);
            };
        }
    }, [teamId, socket, isConnected, fetchHistory, addMessage]);

    useEffect(() => {
        // Auto-scroll to bottom on new messages
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (content: string) => {
        if (socket && isConnected) {
            socket.emit("chat:message", { teamId, content });
        }
    };

    if (isLoading && messages.length === 0) {
        return (
            <div className="h-[500px] flex items-center justify-center bg-[#0F111A]/40 border border-white/10 rounded-2xl backdrop-blur-xl">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full overflow-hidden"
        >
            {/* Custom Integrated Header */}
            <div className="pb-6 mb-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/5">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            {teamName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span className="text-xs text-gray-400">
                                {isConnected ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area - Borderless integration */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
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
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <MessageInput onSendMessage={handleSendMessage} isLoading={!isConnected} />
        </motion.div>
    );
};
