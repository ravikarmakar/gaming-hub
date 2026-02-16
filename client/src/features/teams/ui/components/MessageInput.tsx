import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, Pencil, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "../../store/useChatStore";
import { useTeamStore } from "../../store/useTeamStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

const messageSchema = z.object({
    content: z.string().min(1).max(1000),
});

type MessageValues = z.infer<typeof messageSchema>;

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
}

export const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        editingMessage,
        setEditingMessage,
        updateMessage
    } = useChatStore();
    const { currentTeam } = useTeamStore();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isValid },
    } = useForm<MessageValues>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: "",
        },
    });

    const content = watch("content");

    // Sync content with editingMessage
    useEffect(() => {
        if (editingMessage) {
            setValue("content", editingMessage.content);
            textareaRef.current?.focus();
        } else {
            reset();
        }
    }, [editingMessage, setValue, reset]);

    // Auto-expand logic (WhatsApp inspired)
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "0px"; // Reset height to recalculate
            const scrollHeight = textarea.scrollHeight;

            // Min height is ~44px, Max is ~150px (approx 6 lines)
            const minHeight = 44;
            const maxHeight = 150;

            const nextHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
            textarea.style.height = `${nextHeight}px`;
            textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
        }
    }, [content]);

    const onSubmit = async (data: MessageValues) => {
        if (isLoading || isSubmitting) return;

        const trimmedContent = data.content.trim();
        if (!trimmedContent) return;

        setIsSubmitting(true);
        try {
            if (editingMessage && currentTeam) {
                await updateMessage(currentTeam._id, editingMessage._id, trimmedContent);
                setEditingMessage(null);
            } else {
                onSendMessage(trimmedContent);
                reset();
            }
            if (textareaRef.current) {
                textareaRef.current.style.height = "44px";
            }
        } catch (error) {
            console.error("Failed to process message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    const { ref, ...registerProps } = register("content");

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="pt-4 pb-4 mt-auto w-full flex flex-col"
        >
            <div className="relative w-full px-4 md:px-6">
                {/* Editing Indicator Banner */}
                {editingMessage && (
                    <div className="mb-2 flex items-center justify-between px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-t-2xl text-[11px] text-purple-400">
                        <div className="flex items-center gap-2">
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="font-bold uppercase tracking-wider">Editing Mode</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingMessage(null)}
                            className="p-1 hover:bg-purple-500/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Main Input Container - WhatsApp Style Pill */}
                <div className={cn(
                    "relative flex items-end gap-2 bg-[#1A1D2D]/80 border border-white/10 p-1.5 backdrop-blur-xl transition-all duration-300 shadow-2xl group-focus-within:border-purple-500/40 group-focus-within:bg-[#1A1D2D]",
                    editingMessage ? "rounded-b-[24px] rounded-t-none" : "rounded-[24px]"
                )}>
                    <Textarea
                        {...registerProps}
                        ref={(e) => {
                            ref(e);
                            // @ts-ignore
                            textareaRef.current = e;
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={editingMessage ? "Update your message..." : "Type a message..."}
                        disabled={isLoading || isSubmitting}
                        autoComplete="off"
                        rows={1}
                        className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 py-2.5 px-3.5 text-sm resize-none scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent selection:bg-purple-500/30"
                    />

                    <Button
                        type="submit"
                        disabled={!isValid || isLoading || isSubmitting}
                        size="icon"
                        className={cn(
                            "w-9 h-9 shrink-0 text-white rounded-full shadow-lg transition-all duration-300 active:scale-90 disabled:opacity-40 mb-0.5",
                            editingMessage
                                ? "bg-emerald-600 hover:bg-emerald-500"
                                : "bg-purple-600 hover:bg-purple-500"
                        )}
                    >
                        {editingMessage ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Send className="w-4 h-4 ml-0.5" />
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};
