import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { DangerZone } from "@/components/shared/common/DangerZone";

export const DeleteTeamSection = () => {
    const navigate = useNavigate();
    const { isLoading, deleteTeam } = useTeamManagementStore();

    const handleDeleteTeam = async () => {
        const result = await deleteTeam();
        if (result && result.success) {
            toast.success("Team disbanded successfully!");
            setTimeout(() => navigate("/"), 0);
        } else {
            toast.error(
                result?.message || "Failed to disband team. Please try again."
            );
        }
    };

    return (
        <DangerZone
            title="Danger Zone"
            description="Disbanding the team will delete all data associated with it. This action cannot be undone."
            icon={Trash2}

            actionTitle="Disband this team"
            actionDescription="Once you disband a team, there is no going back. Please be certain."
            buttonText="Disband Team"

            dialogTitle="Disband Team?"
            dialogDescription={
                <>
                    Are you sure you want to disband this team? This action is <span className="text-red-500 font-black uppercase">permanent</span> and cannot be undone.
                    All members will be removed and the team profile will be deleted forever.
                </>
            }
            dialogConfirmLabel="Yes, Disband Team"
            onConfirm={handleDeleteTeam}
            isLoading={isLoading}
        />
    );
};
