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
    isRead: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    currentFetchId: number;

    editingMessage: ChatMessage | null;
    setEditingMessage: (message: ChatMessage | null) => void;

    fetchHistory: (targetId: string, scope: "team" | "organizer" | "group" | "user", loadMore?: boolean) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    updateMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;

    // Real-time synchronization methods
    handleRemoteUpdate: (updatedMessage: ChatMessage) => void;
    handleRemoteDelete: (messageId: string) => void;

    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    currentFetchId: 0,
    editingMessage: null,

    setEditingMessage: (message) => set({ editingMessage: message }),

    fetchHistory: async (targetId, scope, loadMore = false) => {
        const fetchId = Math.random();
        
        if (loadMore) {
            set({ isLoadingMore: true, error: null });
        } else {
            set({ isLoading: true, error: null, currentFetchId: fetchId, hasMore: true });
        }

        // Bypass backend fetch for user-to-user chat until API is ready
        if (scope === "user") {
            const { currentFetchId } = get();
            if (currentFetchId === fetchId || loadMore) {
                set((state) => ({ 
                    messages: loadMore ? state.messages : [], 
                    isLoading: false, 
                    isLoadingMore: false, 
                    hasMore: false 
                }));
            }
            return;
        }

        try {
            let baseUrl = "/teams";
            if (scope === "organizer") baseUrl = "/organizers";
            else if (scope === "group") baseUrl = "/groups";

            const params: any = { scope };
            if (loadMore && get().messages.length > 0) {
                params.before = get().messages[0].createdAt;
            }

            const response = await axiosInstance.get(`${baseUrl}/${targetId}/chat`, { params });
            const newMessages = response.data.data;
            const hasMore = response.data.hasMore;

            if (loadMore) {
                set((state) => ({
                    messages: [...newMessages, ...state.messages],
                    isLoadingMore: false,
                    hasMore
                }));
            } else {
                const { currentFetchId } = get();
                if (currentFetchId === fetchId) {
                    set({ 
                        messages: newMessages, 
                        isLoading: false,
                        hasMore
                    });
                }
            }
        } catch (error) {
            const errMsg = getErrorMessage(error, "Failed to load chat history");
            set({ error: errMsg, isLoading: false, isLoadingMore: false });
        }
    },

    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    updateMessage: async (messageId, content) => {
        const { messages } = useChatStore.getState();
        const message = messages.find(m => m._id === messageId);
        if (!message) throw new Error("Message not found");

        if (message.scope === "user") throw new Error("User chat editing is not supported yet"); // Bypass until API is ready

        let baseUrl = "/teams";
        if (message.scope === "organizer") baseUrl = "/organizers";
        else if (message.scope === "group") baseUrl = "/groups";

        try {
            await axiosInstance.patch(`${baseUrl}/chat/${messageId}`, { content });
            // Local update is handled by socket event chat:update
        } catch (error) {
            console.error("Failed to update message:", error);
            throw error;
        }
    },

    deleteMessage: async (messageId) => {
        const { messages } = useChatStore.getState();
        const message = messages.find(m => m._id === messageId);
        if (!message) throw new Error("Message not found");

        if (message.scope === "user") throw new Error("User chat deletion is not supported yet"); // Bypass until API is ready

        let baseUrl = "/teams";
        if (message.scope === "organizer") baseUrl = "/organizers";
        else if (message.scope === "group") baseUrl = "/groups";

        try {
            await axiosInstance.delete(`${baseUrl}/chat/${messageId}`);
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
