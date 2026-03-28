import { Share2, MoreVertical, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';

interface ProfileHeaderActionsProps {
    onBack: () => void;
    onChatOpen: () => void;
    showUserChat: boolean;
    isOwnProfile: boolean;
    entityId?: string;
}

/**
 * Top navigation and action overlay for the profile header.
 */
export const ProfileHeaderActions = ({
    onBack,
    onChatOpen,
    showUserChat,
    isOwnProfile,
    entityId
}: ProfileHeaderActionsProps) => {
    return (
        <div className="absolute -top-[calc(35vh-192px)] md:-top-[calc(40vh-224px)] lg:-top-[calc(50vh-224px)] inset-x-0 flex items-center justify-between pointer-events-none z-[100]">
            <Button
                className="pointer-events-auto h-7 sm:h-9 px-2.5 sm:px-3 text-white bg-black/40 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/50 backdrop-blur-md rounded-full flex items-center gap-1.5 group transition-all duration-300 active:scale-95 shadow-lg shadow-black/20"
                onClick={onBack}
                aria-label="Go back"
            >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline text-[10px] font-black tracking-widest uppercase">Back</span>
            </Button>

            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                {showUserChat && !isOwnProfile && entityId && (
                    <Button
                        className="w-7 h-7 sm:w-9 sm:h-9 text-white bg-black/40 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/50 backdrop-blur-md rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 flex items-center justify-center p-0"
                        onClick={onChatOpen}
                        aria-label="Open chat"
                    >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                )}
                <Button
                    aria-label="Share profile"
                    className="w-7 h-7 sm:w-9 sm:h-9 text-white bg-black/40 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/50 backdrop-blur-md rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 flex items-center justify-center p-0"
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(window.location.href);
                            toast.success("Profile link copied to clipboard!");
                        } catch (err) {
                            toast.error("Failed to copy link to clipboard");
                        }
                    }}
                >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            aria-label="More options"
                            className="w-7 h-7 sm:w-9 sm:h-9 text-white bg-black/40 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/50 backdrop-blur-md rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 flex items-center justify-center p-0"
                        >
                            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0f1016] border-white/10 text-white min-w-[120px]">
                        <DropdownMenuItem onClick={() => toast("Report feature coming soon", { icon: "ℹ️" })} className="hover:bg-white/5 cursor-pointer">
                            Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Block feature coming soon", { icon: "🚫" })} className="hover:bg-white/5 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10">
                            Block
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
