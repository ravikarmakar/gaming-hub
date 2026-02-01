import { useEffect, useState, memo } from "react";
import { Check, X, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useOrganizerStore, JoinRequest } from "@/features/organizer/store/useOrganizerStore";

const OrganizerJoinRequestsPage = () => {
    const { currentOrg, fetchJoinRequests, joinRequests, manageJoinRequest, isLoading, joinRequestPagination } = useOrganizerStore();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // can(ORG_ROUTE_ACCESS.joinRequests) is handled by the route or can be used for UI masking if needed
    useEffect(() => {
        if (currentOrg?._id) {
            fetchJoinRequests(currentOrg._id, page);
        }
    }, [currentOrg?._id, fetchJoinRequests, page]);

    const handleAction = async (requestId: string, action: "accepted" | "rejected") => {
        if (!currentOrg?._id) return;
        setProcessingId(requestId);
        const success = await manageJoinRequest(currentOrg._id, requestId, action);
        setProcessingId(null);
        if (success) {
            toast.success(`Request ${action} successfully`);
            // Refresh if last item on page removed? fetchJoinRequests will handle it if we call it, but store handles filtering already.
        }
    };

    if (isLoading && !joinRequests) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Join Requests</h1>
                    <p className="text-gray-400 mt-1">Manage pending requests to join your organization</p>
                </div>
                {joinRequestPagination && (
                    <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">
                        {joinRequestPagination.total} Total
                    </Badge>
                )}
            </div>

            {!joinRequests || joinRequests.length === 0 ? (
                <Card className="bg-[#0B0C1A] border-white/5">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
                        <p className="text-gray-400 max-w-sm">
                            There are currently no users requesting to join your organization.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4">
                        {joinRequests.map((request: JoinRequest) => (
                            <JoinRequestItem
                                key={request._id}
                                request={request}
                                processingId={processingId}
                                onAction={handleAction}
                            />
                        ))}
                    </div>

                    {/* Pagination Footer */}
                    {joinRequestPagination && joinRequestPagination.pages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <span className="text-xs text-gray-500">
                                Showing <span className="text-gray-300">{(joinRequestPagination.page - 1) * joinRequestPagination.limit + 1}</span> - <span className="text-gray-300">{Math.min(joinRequestPagination.page * joinRequestPagination.limit, joinRequestPagination.total)}</span> of <span className="text-gray-300">{joinRequestPagination.total}</span> requests
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1}
                                    className="h-8 w-8 p-0 bg-white/5 border-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center gap-1 mx-2 text-xs">
                                    <span className="text-white font-medium">{page}</span>
                                    <span className="text-gray-600">/</span>
                                    <span className="text-gray-500">{joinRequestPagination.pages}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= joinRequestPagination.pages}
                                    className="h-8 w-8 p-0 bg-white/5 border-white/10"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const JoinRequestItem = memo(({ request, processingId, onAction }: {
    request: JoinRequest;
    processingId: string | null;
    onAction: (id: string, action: "accepted" | "rejected") => Promise<void>;
}) => {
    return (
        <Card className="bg-[#0B0C1A] border-white/5 overflow-hidden group hover:border-purple-500/30 transition-colors">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* User Info */}
                <div className="flex items-center gap-4 shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-white/10">
                        <AvatarImage src={request.requester.avatar} />
                        <AvatarFallback className="bg-purple-900/50 text-purple-200">
                            {request.requester.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-white text-lg">{request.requester.username}</h3>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="text-xs uppercase tracking-wider">{request.status}</span>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="flex-1 bg-white/5 p-3 rounded-lg text-gray-300 text-sm italic border border-white/5">
                    "{request.message}"
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                        onClick={() => onAction(request._id, "accepted")}
                        disabled={processingId === request._id}
                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 flex-1 sm:flex-none"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                    </Button>
                    <Button
                        onClick={() => onAction(request._id, "rejected")}
                        disabled={processingId === request._id}
                        variant="outline"
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex-1 sm:flex-none"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

JoinRequestItem.displayName = "JoinRequestItem";

export default OrganizerJoinRequestsPage;

