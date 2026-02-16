import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { TEAM_ENDPOINTS } from "../lib/endpoints";
import { getErrorMessage } from "@/lib/utils";

export interface ChatMessage {
    _id: string;
    team: string;
    sender: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    fetchHistory: (teamId: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    deleteMessage: (teamId: string, messageId: string) => Promise<void>;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,
    error: null,

    fetchHistory: async (teamId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(TEAM_ENDPOINTS.CHAT_HISTORY(teamId));
            set({ messages: response.data.data, isLoading: false });
        } catch (error) {
            const errMsg = getErrorMessage(error, "Failed to load chat history");
            set({ error: errMsg, isLoading: false });
        }
    },

    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    deleteMessage: async (teamId, messageId) => {
        try {
            await axiosInstance.delete(TEAM_ENDPOINTS.DELETE_MESSAGE(teamId, messageId));
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId),
            }));
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    },

    clearMessages: () => set({ messages: [] }),
}));
