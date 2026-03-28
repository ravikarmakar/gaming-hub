import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

export interface ChatMessage {
  _id: string;
  targetId: string;
  scope: string;
  sender: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isEdited: boolean;
  isRead: boolean;
  localId?: string;
  isPending?: boolean;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

function getScopeBaseUrl(scope: string): string {
  if (scope === "organizer") return "/organizers";
  if (scope === "group") return "/groups";
  if (scope === "team") return "/teams";
  if (scope === "user") return "/players";
  throw new Error(`Unsupported chat scope: ${scope}`);
}

export const chatApi = {
  fetchHistory: async (
    targetId: string,
    scope: "team" | "organizer" | "group" | "user",
    before?: string
  ): Promise<ChatHistoryResponse> => {

    try {
      const baseUrl = getScopeBaseUrl(scope);
      const params: Record<string, string> = { scope };
      if (before) params.before = before;

      const response = await axiosInstance.get(`${baseUrl}/${targetId}/chat`, { params });
      return {
        messages: response.data.data,
        hasMore: response.data.hasMore,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch chat history"));
    }
  },

  updateMessage: async (
    targetId: string,
    messageId: string,
    scope: string,
    content: string
  ): Promise<void> => {
    try {
      const baseUrl = getScopeBaseUrl(scope);
      await axiosInstance.patch(`${baseUrl}/${targetId}/chat/${messageId}`, { content });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update message"));
    }
  },

  deleteMessage: async (
    targetId: string,
    messageId: string,
    scope: string
  ): Promise<void> => {
    try {
      const baseUrl = getScopeBaseUrl(scope);
      await axiosInstance.delete(`${baseUrl}/${targetId}/chat/${messageId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to delete message"));
    }
  },
};
