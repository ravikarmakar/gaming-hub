import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { chatKeys } from "./chatKeys";
import { chatApi, ChatMessage, ChatHistoryResponse } from "../api/chatApi";

/**
 * Fetches initial chat history for a target+scope combo.
 */
export const useChatHistoryQuery = (
  targetId: string,
  scope: "team" | "organizer" | "group" | "user"
) => {
  return useQuery({
    queryKey: chatKeys.history(targetId, scope),
    queryFn: () => chatApi.fetchHistory(targetId, scope),
    enabled: !!targetId,
    staleTime: Infinity, // Chat data is managed via WebSocket, not refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

/**
 * Provides helpers to directly manipulate the chat query cache.
 * Used by WebSocket event handlers and load-more logic.
 */
export const useChatCacheHelpers = (targetId: string, scope: "team" | "organizer" | "group" | "user") => {
  const queryClient = useQueryClient();
  // Memoize queryKey to keep stable references for downstream useCallbacks
  const queryKey = useMemo(() => chatKeys.history(targetId, scope), [targetId, scope]);

  const appendMessage = useCallback((message: ChatMessage & { localId?: string, isPending?: boolean }) => {
    queryClient.setQueryData(queryKey, (old: ChatHistoryResponse | undefined) => {
      if (!old) return { messages: [message as ChatMessage], hasMore: false };

      // Reconcile optimistic UI if localId exists
      if (message.localId) {
        const existsIndex = old.messages.findIndex((m: any) => m.localId === message.localId);
        if (existsIndex > -1) {
          const newMessages = [...old.messages];
          newMessages[existsIndex] = message as ChatMessage;
          return { ...old, messages: newMessages };
        }
      }

      return {
        ...old,
        messages: [...old.messages, message as ChatMessage],
      };
    });
  }, [queryClient, queryKey]);

  const updateMessage = useCallback((updatedMessage: ChatMessage) => {
    queryClient.setQueryData(queryKey, (old: ChatHistoryResponse | undefined) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.map((m: ChatMessage) =>
          m._id === updatedMessage._id ? updatedMessage : m
        ),
      };
    });
  }, [queryClient, queryKey]);

  const removeMessage = useCallback((messageId: string) => {
    queryClient.setQueryData(queryKey, (old: ChatHistoryResponse | undefined) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.filter((m: ChatMessage) => m._id !== messageId),
      };
    });
  }, [queryClient, queryKey]);

  const removeMessageByLocalId = useCallback((localId: string) => {
    queryClient.setQueryData(queryKey, (old: ChatHistoryResponse | undefined) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.filter((m: any) => m.localId !== localId),
      };
    });
  }, [queryClient, queryKey]);

  const prependMessages = useCallback((newMessages: ChatMessage[], hasMore: boolean) => {
    queryClient.setQueryData(queryKey, (old: ChatHistoryResponse | undefined) => {
      if (!old) return { messages: newMessages, hasMore };
      return {
        ...old,
        messages: [...newMessages, ...old.messages],
        hasMore,
      };
    });
  }, [queryClient, queryKey]);

  const clearMessages = useCallback(() => {
    queryClient.setQueryData(queryKey, undefined);
  }, [queryClient, queryKey]);

  return {
    appendMessage,
    updateMessage,
    removeMessage,
    removeMessageByLocalId,
    prependMessages,
    clearMessages,
  };
};
