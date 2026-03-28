import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatWindow } from "@/features/chat/ui/components/ChatWindow";
import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { ProfileHeaderActions } from './ProfileHeaderActions';
import { ProfileIdentity } from './ProfileIdentity';

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

const ChatDialog = ({
    open,
    onOpenChange,
    entityId,
    name
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityId?: string;
    name: string;
}) => (
    <Dialog open={Boolean(open && entityId)} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[600px] bg-[#0F111A] border-white/10 p-0 overflow-hidden flex flex-col">
            <DialogHeader className="p-4 border-b border-white/10 flex-shrink-0">
                <DialogTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    {name} - Chat
                </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden p-4">
                {open && entityId && (
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
);

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

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="relative w-full">
            <ProfileHeaderActions
                onBack={handleBack}
                onChatOpen={() => setIsChatOpen(true)}
                showUserChat={!!showUserChat}
                isOwnProfile={isOwnProfile}
                entityId={entityId}
            />

            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 w-full max-w-full">
                <ProfileIdentity
                    avatarImage={avatarImage}
                    name={name}
                    tag={tag}
                    isVerified={isVerified}
                    description={description}
                    infoBlocks={infoBlocks}
                    badges={badges}
                />

                {/* Unified Actions Section */}
                {actions && (
                    <div
                        className="flex items-center gap-2 md:gap-3 w-full md:w-auto pt-2 md:pt-2 pb-4 md:pb-1 px-1 md:px-0 shrink-0 [&>*]:flex-1 md:[&>*]:flex-none"
                        data-testid="header-actions"
                    >
                        {actions}
                    </div>
                )}

                <ChatDialog
                    open={isChatOpen}
                    onOpenChange={(open) => setIsChatOpen(open)}
                    entityId={entityId}
                    name={name}
                />
            </div>
        </div>
    );
};
