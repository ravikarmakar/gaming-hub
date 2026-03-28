import { createContext, useCallback, useContext, useState } from "react";
import type { ChatMessage } from "../api/chatApi";

interface ChatContextValue {
    editingMessage: ChatMessage | null;
    setEditingMessage: (message: ChatMessage | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [editingMessage, setEditingMessageState] = useState<ChatMessage | null>(null);

    const setEditingMessage = useCallback((message: ChatMessage | null) => {
        setEditingMessageState(message);
    }, []);

    return (
        <ChatContext.Provider value={{ editingMessage, setEditingMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = (): ChatContextValue => {
    const ctx = useContext(ChatContext);
    if (!ctx) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return ctx;
};
