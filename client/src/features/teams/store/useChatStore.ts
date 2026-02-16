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
    senderRole: "owner" | "manager" | "member";
    content: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    isEdited: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    editingMessage: ChatMessage | null;
    setEditingMessage: (message: ChatMessage | null) => void;

    fetchHistory: (teamId: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    updateMessage: (teamId: string, messageId: string, content: string) => Promise<void>;
    deleteMessage: (teamId: string, messageId: string) => Promise<void>;

    // Real-time synchronization methods
    handleRemoteUpdate: (updatedMessage: ChatMessage) => void;
    handleRemoteDelete: (messageId: string) => void;

    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,
    error: null,
    editingMessage: null,

    setEditingMessage: (message) => set({ editingMessage: message }),

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

    updateMessage: async (teamId, messageId, content) => {
        try {
            await axiosInstance.patch(TEAM_ENDPOINTS.CHAT_MESSAGE_ACTION(teamId, messageId), { content });
            // Local update is handled by socket event chat:update
        } catch (error) {
            console.error("Failed to update message:", error);
            throw error;
        }
    },

    deleteMessage: async (teamId, messageId) => {
        try {
            await axiosInstance.delete(TEAM_ENDPOINTS.CHAT_MESSAGE_ACTION(teamId, messageId));
            // Local update is handled by socket event chat:delete
        } catch (error) {
            console.error("Failed to delete message:", error);
            throw error;
        }
    },

    handleRemoteUpdate: (updatedMessage) => {
        set((state) => ({
            messages: state.messages.map((m) =>
                m._id === updatedMessage._id ? updatedMessage : m
            ),
        }));
    },

    handleRemoteDelete: (messageId) => {
        set((state) => ({
            messages: state.messages.filter((m) => m._id !== messageId),
        }));
    },

    clearMessages: () => set({ messages: [] }),
}));
