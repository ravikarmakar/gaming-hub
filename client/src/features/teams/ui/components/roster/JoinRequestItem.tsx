import React from 'react';
import { User, Check, X, MessageSquare, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JoinRequest } from '@/features/teams/lib/types';

interface JoinRequestItemProps {
    request: JoinRequest;
    onHandle: (id: string, action: 'accepted' | 'rejected') => void;
    isPending: boolean;
}

export const JoinRequestItem: React.FC<JoinRequestItemProps> = ({ request, onHandle, isPending }) => {
    const [avatarError, setAvatarError] = React.useState(false);

    React.useEffect(() => {
        setAvatarError(false);
    }, [request.requester.avatar]);

    return (
        <Card
            className="bg-[#0F111A]/60 border-white/10 hover:border-purple-500/50 hover:bg-[#121421]/80 transition-all duration-500 group overflow-hidden relative backdrop-blur-xl shadow-2xl shadow-purple-500/5"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="p-5 flex flex-col sm:flex-row gap-5 relative z-10">
                <div className="flex items-start gap-4 shrink-0">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-zinc-800 border-2 border-white/5 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                            {request.requester.avatar && !avatarError ? (
                                <img 
                                    src={request.requester.avatar} 
                                    alt={request.requester.username} 
                                    className="w-full h-full object-cover" 
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-900 rounded-full p-0.5 border border-white/10">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                            {request.requester.username}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-white/5 sm:hidden" />

                <div className="flex-1 flex flex-col justify-between gap-4">
                    <div className="relative bg-white/[0.03] rounded-lg p-3 border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                        <MessageSquare className="w-3 h-3 text-purple-400/50 absolute top-3 right-3" />
                        <p className="text-sm text-gray-300 italic leading-relaxed pr-6 line-clamp-2 hover:line-clamp-none transition-all">
                            "{request.message || 'No additional message provided.'}"
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-1 sm:justify-end">
                        <Button
                            onClick={() => onHandle(request._id, 'rejected')}
                            disabled={isPending}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none border-white/10 bg-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-gray-400 h-9 transition-all"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Decline
                        </Button>
                        <Button
                            onClick={() => onHandle(request._id, 'accepted')}
                            disabled={isPending}
                            size="sm"
                            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 text-white border-0 h-9 shadow-lg shadow-purple-900/20 hover:shadow-purple-600/30 transition-all font-medium"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
