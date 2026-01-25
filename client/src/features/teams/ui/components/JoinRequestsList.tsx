import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Check, X, MessageSquare, Clock, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useTeamStore } from '../../store/useTeamStore';

export const JoinRequestsList: React.FC = () => {
    const { joinRequests, fetchJoinRequests, handleJoinRequest, isLoading, currentTeam } = useTeamStore();

    useEffect(() => {
        // Only fetch if there are pending requests indicated by the team details
        // optimized to prevent unnecessary backend calls
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

    if (isLoading && joinRequests.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (joinRequests.length === 0) {
        return (
            <Card className="bg-white/5 border-white/10 p-12 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-1">No Pending Requests</h3>
                <p className="text-gray-500 text-sm">When players apply to join your team, they will appear here.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Join Applications
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {joinRequests.map((request) => (
                    <Card key={request._id} className="bg-white/5 border-white/10 hover:bg-white/[0.08] transition-all group overflow-hidden">
                        <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                            {/* Requester Info */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 overflow-hidden">
                                    {request.requester.avatar ? (
                                        <img src={request.requester.avatar} alt={request.requester.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold group-hover:text-purple-400 transition-colors">
                                        {request.requester.username}
                                    </h4>
                                    <p className="text-xs text-gray-500">Applied {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="flex-1 bg-white/[0.03] rounded-lg p-3 border border-white/5 relative">
                                <MessageSquare className="w-3 h-3 text-gray-600 absolute top-2 right-2" />
                                <p className="text-sm text-gray-300 italic pr-6">
                                    "{request.message || 'No message provided.'}"
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => onHandle(request._id, 'accepted')}
                                    disabled={isLoading}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 h-10 px-4 gap-2 rounded-lg"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => onHandle(request._id, 'rejected')}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="border-white/10 bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 text-white h-10 px-4 gap-2 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                    Decline
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
