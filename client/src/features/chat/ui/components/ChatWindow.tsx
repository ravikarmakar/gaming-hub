import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, LoaderCircle as Loader2, Maximize2, ArrowDown } from "lucide-react";
import { FixedSizeList as List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

import { useSocket } from "@/contexts/SocketContext";
import { useCurrentUser } from "@/features/auth";
import { useChatStore, ChatMessage } from "../../store/useChatStore";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";

const MessageRow = ({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
  const { messages, user, canDeleteParent, isPage } = data;
  const msg = messages[index];
  if (!msg) return null;

  return (
    <div style={style} className={cn("px-4 md:px-6", isPage && "md:px-4")}>
      <MessageItem
        message={msg}
        isOwnMessage={msg.sender === user?._id}
        canDeleteParent={canDeleteParent}
      />
    </div>
  );
};

interface ChatWindowProps {
  targetId: string;
  targetName: string;
  scope: "team" | "organizer" | "group" | "user";
  canDeleteParent?: boolean;
  variant?: "window" | "page";
  hideHeader?: boolean;
}

export const ChatWindow = ({
  targetId,
  targetName,
  scope,
  canDeleteParent,
  variant = "window",
  hideHeader
}: ChatWindowProps) => {
  const { socket, isConnected } = useSocket();
  const { user } = useCurrentUser();
  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchHistory,
    addMessage,
    clearMessages
  } = useChatStore();

  const listRef = useRef<List>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevMessagesCount = useRef(messages.length);

  const isPage = variant === "page";

  // Initialize/Cleanup
  useEffect(() => {
    fetchHistory(targetId, scope);

    if (socket && isConnected) {
      socket.emit("join:chat", { targetId, scope });

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

  // Handle auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.sender === user?._id;
      const addedToBottom = lastMessage?.createdAt >= (messages[prevMessagesCount.current - 1]?.createdAt || "");

      if (addedToBottom) {
        if (isOwnMessage || isAtBottom) {
          listRef.current?.scrollToItem(messages.length - 1, "end");
          if (isOwnMessage) {
            setIsAtBottom(true);
            setShowScrollToBottom(false);
          }
        } else {
          setShowScrollToBottom(true);
        }
      }
    } else if (messages.length > 0 && prevMessagesCount.current === 0) {
      // Initial load
      listRef.current?.scrollToItem(messages.length - 1, "end");
      setIsAtBottom(true);
    }
    prevMessagesCount.current = messages.length;
  }, [messages, isAtBottom, user?._id]);

  const handleScroll = useCallback(({ scrollOffset, scrollDirection, scrollUpdateWasRequested }: any, containerHeight: number) => {
    if (scrollUpdateWasRequested) return;

    const itemSize = 70;
    const totalHeight = messages.length * itemSize;

    // Detect if at bottom (within 100px)
    const isNearBottom = scrollOffset + containerHeight >= totalHeight - 100;

    if (isNearBottom) {
      setIsAtBottom(true);
      setShowScrollToBottom(false);
    } else {
      setIsAtBottom(false);
    }

    // Infinite scroll: fetch history when near top
    if (scrollDirection === "backward" && scrollOffset < 100 && hasMore && !isLoadingMore) {
      fetchHistory(targetId, scope, true);
    }
  }, [messages.length, hasMore, isLoadingMore, fetchHistory, targetId, scope]);

  const handleSendMessage = (content: string) => {
    if (socket && isConnected) {
      socket.emit("chat:message", { targetId, scope, content });
    }
  };

  const scrollToBottom = () => {
    listRef.current?.scrollToItem(messages.length - 1, "end");
    setShowScrollToBottom(false);
    setIsAtBottom(true);
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
        "flex flex-col overflow-hidden relative",
        isPage ? "flex-1 h-full w-full bg-[#0F111A]/60" : "h-[600px]"
      )}
    >
      {/* Custom Integrated Header */}
      {!hideHeader && (variant !== "window" || isPage) && (
        <div className={cn(
          "pb-4 md:pb-6 mb-4 md:mb-6 border-b border-white/10 flex items-center justify-between px-4 md:px-0",
          isPage && "pt-4 md:pt-4 px-4"
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
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col w-full relative">
        {isLoadingMore && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-[#1A1D2D]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-xl">
            <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
            <span className="text-[10px] text-gray-300">Loading history...</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm italic">Be the first to say something!</p>
          </div>
        ) : (
          <AutoSizer renderProp={({ height, width }: { height?: number; width?: number }) => (
            <List
              ref={listRef}
              height={height || 600}
              width={width || 400}
              itemCount={messages.length}
              itemSize={70}
              onScroll={(props) => handleScroll(props, height || 600)}
              className="no-scrollbar"
              itemData={{
                messages,
                user,
                canDeleteParent,
                isPage
              }}
            >
              {MessageRow}
            </List>
          )} />
        )}

        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-6 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-900/40 transition-all hover:scale-110 active:scale-95 z-20 flex items-center gap-2 px-3"
          >
            <span className="text-[10px] font-bold">New Messages</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input Container */}
      <div className="mt-auto w-full border-t border-white/5 bg-[#0F111A]/40 backdrop-blur-md p-1.5 md:p-2">
        <MessageInput onSendMessage={handleSendMessage} isLoading={!isConnected} />
      </div>
    </motion.div >
  );
};
