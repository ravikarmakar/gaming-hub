import { create } from "zustand";
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
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    editingMessage: ChatMessage | null;
    setEditingMessage: (message: ChatMessage | null) => void;

    fetchHistory: (targetId: string, scope: "team" | "organizer") => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    updateMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;

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

    fetchHistory: async (targetId, scope) => {
        set({ isLoading: true, error: null });
        try {
            const baseUrl = scope === "team" ? "/teams" : "/organizers";
            const response = await axiosInstance.get(`${baseUrl}/${targetId}/chat`, {
                params: { scope }
            });
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

    updateMessage: async (messageId, content) => {
        try {
            // Scope-agnostic patch route (could be under /teams or /organizers, but we generalized it)
            await axiosInstance.patch(`/teams/chat/${messageId}`, { content });
            // Local update is handled by socket event chat:update
        } catch (error) {
            console.error("Failed to update message:", error);
            throw error;
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await axiosInstance.delete(`/teams/chat/${messageId}`);
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
            editingMessage: state.editingMessage?._id === updatedMessage._id
                ? updatedMessage
                : state.editingMessage
        }));
    },

    handleRemoteDelete: (messageId) => {
        set((state) => ({
            messages: state.messages.filter((m) => m._id !== messageId),
            editingMessage: state.editingMessage?._id === messageId
                ? null
                : state.editingMessage
        }));
    },

    clearMessages: () => set({ messages: [] }),
}));
