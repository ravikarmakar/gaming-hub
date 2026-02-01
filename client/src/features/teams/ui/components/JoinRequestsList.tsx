import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Check, X, MessageSquare, Clock } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useTeamStore } from '../../store/useTeamStore';
import { TeamLoading } from './TeamLoading';

export const JoinRequestsList: React.FC = () => {
    const { joinRequests, fetchJoinRequests, handleJoinRequest, isLoading, currentTeam } = useTeamStore();

    useEffect(() => {
        if (currentTeam?.pendingRequestsCount && currentTeam.pendingRequestsCount > 0) {
            fetchJoinRequests();
        }
    }, [fetchJoinRequests, currentTeam?.pendingRequestsCount]);

    const onHandle = async (requestId: string, action: 'accepted' | 'rejected') => {
        const res = await handleJoinRequest(requestId, action);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    };

    if (isLoading && (!joinRequests || joinRequests.length === 0)) {
        return <TeamLoading message="Loading applications..." />;
    }

    if (!joinRequests || joinRequests.length === 0) {
        return (
            <Card className="bg-[#0F111A]/40 border-white/10 p-12 text-center backdrop-blur-md">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-1">No Pending Requests</h3>
                <p className="text-gray-500 text-sm">When players apply to join your team, they will appear here.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Join Requests</h2>
                        <p className="text-xs text-gray-400">Review and manage pending applications ({joinRequests.length})</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {joinRequests.map((request) => (
                    <Card
                        key={request._id}
                        className="bg-[#0F111A]/60 border-white/10 hover:border-purple-500/50 hover:bg-[#121421]/80 transition-all duration-500 group overflow-hidden relative backdrop-blur-xl shadow-2xl shadow-purple-500/5"
                    >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="p-5 flex flex-col sm:flex-row gap-5 relative z-10">
                            {/* Requester Profile */}
                            <div className="flex items-start gap-4 shrink-0">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-zinc-800 border-2 border-white/5 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                                        {request.requester.avatar ? (
                                            <img src={request.requester.avatar} alt={request.requester.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-500" />
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

                            {/* Divider for mobile */}
                            <div className="h-px w-full bg-white/5 sm:hidden" />

                            {/* Message & Actions */}
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
                                        disabled={isLoading}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-none border-white/10 bg-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-gray-400 h-9 transition-all"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Decline
                                    </Button>
                                    <Button
                                        onClick={() => onHandle(request._id, 'accepted')}
                                        disabled={isLoading}
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
                ))}
            </div>
        </div>
    );
};
