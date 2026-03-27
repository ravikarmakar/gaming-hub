import React from 'react';
import { Award, ArrowLeft, Share2, MoreVertical, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatWindow } from "@/features/chat/ui/components/ChatWindow";
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import toast from 'react-hot-toast';

interface UnifiedProfileHeaderProps {
    avatarImage: string;
    name: string;
    tag?: string;
    isVerified?: boolean;
    description?: React.ReactNode;
    infoBlocks?: React.ReactNode;
    badges?: React.ReactNode;
    actions?: React.ReactNode;
    entityId?: string;
    showUserChat?: boolean;
}

/**
 * A standard header component for Player, Team, and Organizer profiles.
 * Consolidates the identity, description, stats, and action areas.
 */
export const UnifiedProfileHeader = ({
    avatarImage,
    name,
    tag,
    isVerified,
    description,
    infoBlocks,
    badges,
    actions,
    entityId,
    showUserChat
}: UnifiedProfileHeaderProps) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    const isOwnProfile = !!(user?._id && entityId && user._id.toString() === entityId.toString());

    return (
        <div className="relative w-full">
            {/* Top Navigation Actions (Snapped to absolute top) */}
            <div className="absolute -top-[calc(35vh-192px)] md:-top-[calc(40vh-224px)] lg:-top-[calc(50vh-224px)] inset-x-0 flex items-center justify-between pointer-events-none z-[100]">
                <Button
                    className="pointer-events-auto h-7 sm:h-9 px-2.5 sm:px-3 text-white bg-black/40 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/50 backdrop-blur-md rounded-full flex items-center gap-1.5 group transition-all duration-300 active:scale-95 shadow-lg shadow-black/20"
                    onClick={() => {
                        if (window.history.state && window.history.state.idx > 0) {
                            navigate(-1);
                        } else {
                            navigate('/', { replace: true });
                        }
                    }}
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline text-[10px] font-black tracking-widest uppercase">Back</span>
                </Button>

                <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                    {showUserChat && !isOwnProfile && entityId && (
                        <Button
                            className="w-7 h-7 sm:w-9 sm:h-9 text-white bg-black/40 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/50 backdrop-blur-md rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 flex items-center justify-center p-0"
                            onClick={() => setIsChatOpen(true)}
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

            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 w-full max-w-full">
                <div className="flex flex-row items-start gap-4 md:gap-8 flex-1 min-w-0">
                    {/* Standard Avatar Container (Slightly smaller, aligned to touch banner bottom) */}
                    <div className="relative group/avatar shrink-0 isolate -mt-4 md:-mt-8">
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-[#0d091a] border-4 border-[#050505] overflow-hidden shadow-2xl relative z-10 transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                            <img
                                src={avatarImage || "/assets/images/default-avatar.png"}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Glow Effect Layer */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition duration-500" />

                        {isVerified && (
                            <div className="absolute p-1 bg-blue-500 rounded-full sm:p-2 bottom-0 right-0 sm:-bottom-2 sm:-right-2 z-20 shadow-xl border-4 border-[#050505]">
                                <Award className="w-3 h-3 text-white sm:w-4 sm:h-4" />
                            </div>
                        )}
                    </div>

                    {/* Content Section: Name, Bio, Meta info */}
                    <div className="flex-1 min-w-0 space-y-4 md:space-y-6 text-left">
                        <div className="flex flex-col gap-1.5 md:gap-2">
                            <div className="flex flex-nowrap items-baseline justify-start gap-2 md:gap-4 min-w-0">
                                <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-white leading-tight truncate min-w-0">
                                    {name}
                                </h1>
                                {tag && (
                                    <span className="text-xs sm:text-sm md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 shrink-0">
                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                )}
                            </div>

                            {description && (
                                <div className="max-w-2xl text-xs md:text-base text-white/40 font-medium leading-relaxed italic border-l-2 border-violet-500/20 pl-2 mx-0 line-clamp-2">
                                    {description}
                                </div>
                            )}

                            {infoBlocks && (
                                <div className="flex flex-nowrap items-center justify-start gap-4 min-w-0">
                                    {infoBlocks}
                                </div>
                            )}

                            {badges && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {badges}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Unified Actions Section: Responsive position and sizing */}
                {actions && (
                    <div 
                        className="flex items-center gap-2 md:gap-3 w-full md:w-auto pt-2 md:pt-2 pb-4 md:pb-1 px-1 md:px-0 shrink-0 [&>*]:flex-1 md:[&>*]:flex-none" 
                        data-testid="header-actions"
                    >
                        {actions}
                    </div>
                )}

                <Dialog open={Boolean(isChatOpen && entityId)} onOpenChange={(open) => {
                    if (open && !entityId) return;
                    setIsChatOpen(open);
                }}>
                    <DialogContent className="max-w-2xl h-[600px] bg-[#0F111A] border-white/10 p-0 overflow-hidden flex flex-col">
                        <DialogHeader className="p-4 border-b border-white/10 flex-shrink-0">
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                {name} - Chat
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden p-4">
                            {isChatOpen && entityId && (
                                <ChatWindow
                                    targetId={entityId}
                                    targetName={name}
                                    scope="user"
                                    variant="window"
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
