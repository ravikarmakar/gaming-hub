import { useMutation } from "@tanstack/react-query";
import { chatApi } from "../api/chatApi";
import { toast } from "react-hot-toast";

export const useUpdateMessageMutation = () => {
    return useMutation({
        mutationFn: ({ targetId, messageId, scope, content }: { targetId: string; messageId: string; scope: string; content: string }) =>
            chatApi.updateMessage(targetId, messageId, scope, content),
        // Local update is handled by socket event chat:update — no cache invalidation needed
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to update message. Please try again.";
            toast.error(message);
        }
    });
};

export const useDeleteMessageMutation = () => {
    return useMutation({
        mutationFn: ({ targetId, messageId, scope }: { targetId: string; messageId: string; scope: string }) =>
            chatApi.deleteMessage(targetId, messageId, scope),
        // Local update is handled by socket event chat:delete — no cache invalidation needed
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to delete message. Please try again.";
            toast.error(message);
        }
    });
};
