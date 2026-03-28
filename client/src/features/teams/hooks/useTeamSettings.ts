import { useTeamDashboard } from "../context/TeamDashboardContext";
import { useTeamSettingsForm } from "./useTeamSettingsForm";
import { useTeamSettingsUpdate } from "./useTeamSettingsUpdate";

export const useTeamSettings = () => {
    const { team: currentTeam, permissions, isLoading: isFetchLoading } = useTeamDashboard();
    
    const { form, isDirty, handleReset } = useTeamSettingsForm(currentTeam || null);
    const { updateSettings, isUpdating } = useTeamSettingsUpdate(currentTeam?._id || "", form);

    const canManageSettings = permissions.isOwner || permissions.canManageStaff;
    const isLoading = isFetchLoading || isUpdating;

    return {
        form,
        currentTeam,
        permissions,
        isLoading,
        canManageSettings,
        onSubmit: form.handleSubmit(updateSettings),
        handleReset,
        isDirty,
    };
};
