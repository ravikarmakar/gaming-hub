import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const messageSchema = z.object({
    content: z.string().min(1).max(1000),
});

type MessageValues = z.infer<typeof messageSchema>;

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
}

export const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm<MessageValues>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: "",
        },
    });

    const onSubmit = (data: MessageValues) => {
        if (!isLoading) {
            onSendMessage(data.content.trim());
            reset();
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="pt-6 mt-auto"
        >
            <div className="relative group transition-all duration-500">
                {/* Visual Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>

                <div className="relative flex items-center gap-3 bg-[#0F111A]/80 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl group-focus-within:border-purple-500/40 transition-all shadow-2xl">
                    <Input
                        {...register("content")}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        autoComplete="off"
                        className="bg-transparent border-none text-white placeholder:text-gray-500 rounded-xl pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm"
                    />
                    <Button
                        type="submit"
                        disabled={!isValid || isLoading}
                        size="icon"
                        className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-900/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </form>
    );
};
