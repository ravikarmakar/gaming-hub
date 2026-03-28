import { useState } from "react";
import toast from "react-hot-toast";

import { useDebounce } from "@/hooks/useDebounce";
import { useInviteStaffMutation } from "../../hooks/useOrganizerMutations";
import { useSearchAvailableUsersQuery } from "../../hooks/useOrganizerQueries";
import { ORG_ROLE } from "@/features/organizer/lib/access";
import { InviteDialog } from "@/components/shared/dialogs/InviteDialog";

interface OrganizerInviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgId: string;
}

export const OrganizerInviteDialog = ({ open, onOpenChange, orgId }: OrganizerInviteDialogProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const inviteMutation = useInviteStaffMutation();
    const isInviting = inviteMutation.isPending;

    const { data: availableUsers, isLoading: isSearching } = useSearchAvailableUsersQuery(
        debouncedSearch,
        1,
        10,
        { enabled: open }
    );

    const handleSendInvite = (userId: string, role: string, message: string) => {
        return new Promise<void>((resolve) => {
            inviteMutation.mutate(
                { orgId, userId, role, message },
                {
                    onSuccess: () => {
                        toast.success("Invitation sent successfully");
                        onOpenChange(false);
                        resolve();
                    },
                    onError: (error: any) => {
                        toast.error(error.message || "Failed to send invitation");
                        resolve(); // Resolve anyway so UI unblocks, or reject depending on desired behavior.
                    }
                }
            );
        });
    };

    return (
        <InviteDialog
            open={open}
            onOpenChange={onOpenChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isSearching={isSearching}
            searchResults={availableUsers || []}
            onInvite={handleSendInvite}
            isInviting={isInviting}
            defaultRole={ORG_ROLE.STAFF}
            roles={[
                { label: "Staff", value: ORG_ROLE.STAFF },
                { label: "Manager", value: ORG_ROLE.MANAGER },
            ]}
        />
    );
};

