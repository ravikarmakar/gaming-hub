import { useCurrentUser } from "@/features/auth";
import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import { ChatWindow } from "@/features/chat";
import { useAccess } from "@/features/auth/hooks/use-access";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";

export const OrganizerChatPage = () => {
    const { user } = useCurrentUser();
    const { can } = useAccess();

    const {
        data: orgData,
        isLoading: isOrgLoading,
    } = useGetOrgByIdQuery(user?.orgId as string, 1, 1, "", {
        enabled: !!user?.orgId,
    });

    const currentOrg = orgData?.data;
    const canManageChat = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateRole]); // Logic for deletion/management

    if (isOrgLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0F111A]/60">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentOrg) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0F111A]/60">
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-2">No Organization Found</h2>
                    <p className="text-gray-400">You must be part of an organization to view the chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] w-full">
            <ChatWindow
                targetId={currentOrg._id as string}
                targetName={currentOrg.name}
                scope="organizer"
                variant="page"
                canDeleteParent={canManageChat}
            />
        </div>
    );
};

export default OrganizerChatPage;
