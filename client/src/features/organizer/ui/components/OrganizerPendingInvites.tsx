import { useEffect } from "react";
import { format } from "date-fns";
import { X, Clock } from "lucide-react";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

interface OrganizerPendingInvitesProps {
    orgId: string;
}

export const OrganizerPendingInvites = ({ orgId }: OrganizerPendingInvitesProps) => {
    const { fetchPendingInvites, pendingInvites, cancelInvite, isLoading } = useOrganizerStore();

    useEffect(() => {
        fetchPendingInvites(orgId);
    }, [orgId, fetchPendingInvites]);

    const handleCancel = async (inviteId: string) => {
        const success = await cancelInvite(orgId, inviteId);
        if (success) {
            toast.success("Invitation cancelled");
        } else {
            toast.error("Failed to cancel invitation");
        }
    };

    if (!pendingInvites || pendingInvites.length === 0) return null;

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Pending Invitations
                <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">
                    {pendingInvites.length}
                </Badge>
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingInvites.map((invite: any) => (
                    <Card key={invite._id} className="bg-[#1a1b2e] border-white/5 overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="w-10 h-10 border border-white/10">
                                    <AvatarImage src={invite.receiver.avatar} />
                                    <AvatarFallback>{invite.receiver.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-white truncate">{invite.receiver.username}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-white/5 hover:bg-white/10 text-gray-300">
                                            {invite.role.split(":")[1] || invite.role}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(invite.createdAt), "MMM d")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(invite._id)}
                                disabled={isLoading}
                                className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
