import { useEffect, useCallback, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { chatApi, ChatMessage } from "../api/chatApi";
import { useChatCacheHelpers } from "./useChatQueries";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "./chatKeys";

interface UseChatSocketOptions {
  targetId: string;
  scope: "team" | "organizer" | "group" | "user";
  socket: Socket | null;
  isConnected: boolean;
}

/**
 * Manages WebSocket event binding for chat and provides helpers for
 * load-more history. Directly manipulates the TanStack Query cache.
 */
export const useChatSocket = ({
  targetId,
  scope,
  socket,
  isConnected,
}: UseChatSocketOptions) => {
  const queryClient = useQueryClient();
  const {
    appendMessage,
    updateMessage,
    removeMessage,
    prependMessages,
  } = useChatCacheHelpers(targetId, scope);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(isLoadingMore);
  isLoadingMoreRef.current = isLoadingMore;

  const [hasMore, setHasMore] = useState(true);

  // Use refs for cache helpers so the socket effect doesn't re-fire
  // when callbacks change — only when socket/target actually changes
  const helpersRef = useRef({ appendMessage, updateMessage, removeMessage, prependMessages });
  helpersRef.current = { appendMessage, updateMessage, removeMessage, prependMessages };

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const contextRef = useRef({ targetId, scope });
  contextRef.current = { targetId, scope };

  const loadMoreMessages = useCallback(async (oldestCreatedAt: string) => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;

    const capturedTargetId = targetId;
    const capturedScope = scope;

    setIsLoadingMore(true);
    try {
      const result = await chatApi.fetchHistory(capturedTargetId, capturedScope, oldestCreatedAt);

      // Verify context hasn't changed before applying
      if (capturedTargetId === contextRef.current.targetId && capturedScope === contextRef.current.scope) {
        helpersRef.current.prependMessages(result.messages, result.hasMore);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [targetId, scope]);

  // Bind/unbind socket events — only depends on socket identity & target
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("join:chat", { targetId, scope });

    // Catch-up fetch on mount or reconnect to ensure no messages were lost
    // during navigation or network disconnects.
    queryClient.invalidateQueries({ queryKey: chatKeys.history(targetId, scope) });

    const handleMessage = (message: ChatMessage) => {
      const isTargetMatch = scope === "user"
        ? (message.sender === targetId || message.targetId === targetId)
        : message.targetId === targetId;

      if (isTargetMatch && message.scope === scope) {
        helpersRef.current.appendMessage(message);
      }
    };

    const handleUpdate = (message: ChatMessage) => {
      const isTargetMatch = scope === "user"
        ? (message.sender === targetId || message.targetId === targetId)
        : message.targetId === targetId;

      if (isTargetMatch && message.scope === scope) {
        helpersRef.current.updateMessage(message);
      }
    };

    const handleDelete = ({ messageId, targetId: msgTargetId, scope: msgScope, senderId }: { messageId: string; targetId: string; scope: string; senderId?: string }) => {
      const isTargetMatch = scope === "user"
        ? (msgTargetId === targetId || senderId === targetId)
        : msgTargetId === targetId;

      if (isTargetMatch && msgScope === scope) {
        helpersRef.current.removeMessage(messageId);
      }
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:update", handleUpdate);
    socket.on("chat:delete", handleDelete);

    return () => {
      socket.emit("leave:chat", { targetId, scope });
      socket.off("chat:message", handleMessage);
      socket.off("chat:update", handleUpdate);
      socket.off("chat:delete", handleDelete);
    };
  }, [targetId, scope, socket, isConnected, queryClient]);

  return {
    isLoadingMore,
    hasMore,
    setHasMore,
    loadMoreMessages,
  };
};
