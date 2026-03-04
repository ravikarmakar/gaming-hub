import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
    useAddStaffMutation,
    useRemoveStaffMutation,
    useUpdateStaffRoleMutation,
    useTransferOwnershipMutation,
    useLeaveOrgMutation,
} from "./useOrganizerMutations";
import { useNavigate } from "react-router-dom";

export const useManageOrgMembers = (orgId?: string) => {
    const navigate = useNavigate();
    const handleError = (err: unknown, fallback: string) => {
        const axiosError = err as AxiosError<{ message: string }>;
        toast.error(axiosError.response?.data?.message || axiosError.message || fallback);
    };

    const { mutate: addStaffs, isPending: isAddingStaff } = useAddStaffMutation({
        onSuccess: () => toast.success("Members added successfully!"),
        onError: (err) => handleError(err, "Failed to add members"),
    });

    const { mutate: removeStaff, isPending: isRemovingStaff, variables: removeVars } = useRemoveStaffMutation({
        onSuccess: () => toast.success("Staff removed successfully"),
        onError: (err) => handleError(err, "Failed to remove staff"),
    });

    const { mutate: updateStaffRole, isPending: isUpdatingRole, variables: updateVars } = useUpdateStaffRoleMutation({
        onSuccess: () => toast.success("Role updated successfully"),
        onError: (err) => handleError(err, "Failed to update role"),
    });

    const { mutate: transferOwnership, isPending: isTransferringOwnership, variables: transferVars } = useTransferOwnershipMutation({
        onSuccess: () => {
            toast.success("Ownership transferred successfully");
            useAuthStore.getState().checkAuth();
        },
        onError: (err) => handleError(err, "Failed to transfer ownership"),
    });

    const { mutate: leaveOrg, isPending: isLeavingOrg } = useLeaveOrgMutation({
        onSuccess: () => {
            toast.success("You have left the organization");
            useAuthStore.getState().checkAuth();
            navigate("/");
        },
        onError: (err) => handleError(err, "Failed to leave organization"),
    });

    const handleAddSelectedMembers = (ids: string[]) => {
        if (!orgId) return;
        addStaffs({ orgId, data: { staff: ids } });
    };

    const handleStaffRemove = (id: string) => {
        if (!orgId) return;
        removeStaff({ orgId, id });
    };

    const handleLeaveOrg = () => {
        if (!orgId) return;
        if (confirm("Are you sure you want to leave this organization?")) {
            leaveOrg(orgId);
        }
    };

    const handleUpdateRole = (memberId: string, newRole: string) => {
        if (!orgId) return;
        updateStaffRole({ orgId, userId: memberId, role: newRole });
    };

    const handleTransferOwnership = (memberId: string) => {
        if (!orgId) return;
        transferOwnership({ orgId, userId: memberId });
    };

    const pendingMemberId =
        (isRemovingStaff ? removeVars?.id : null) ||
        (isUpdatingRole ? updateVars?.userId : null) ||
        (isTransferringOwnership ? transferVars?.userId : null) ||
        (isLeavingOrg ? orgId : null) ||
        null;

    return {
        handleAddSelectedMembers,
        handleStaffRemove,
        handleLeaveOrg,
        handleUpdateRole,
        handleTransferOwnership,
        isAddingStaff,
        isLeavingOrg,
        pendingMemberId,
    };
};
