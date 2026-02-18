import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { teamSchema, TeamForm } from "@/features/teams/lib/teamSchema";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";

export const useCreateTeam = () => {
    const navigate = useNavigate();
    const { isCreateTeamOpen, setIsCreateTeamOpen, error, clearError } = useTeamStore();
    const { createTeam, isLoading } = useTeamManagementStore();

    const form = useForm<TeamForm>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            teamName: "",
            tag: "",
            region: "INDIA",
            bio: "",
        },
    });

    const { handleSubmit, reset } = form;

    const onSubmit = async (data: TeamForm) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value) formData.append(key, value as string | Blob);
        });

        const result = await createTeam(formData);

        if (result) {
            toast.success("Team created successfully!");

            // Update auth state to get the new teamId and roles before navigating
            await useAuthStore.getState().checkAuth(true);

            setIsCreateTeamOpen(false);
            reset();
            navigate(TEAM_ROUTES.DASHBOARD);
        }
    };

    useEffect(() => {
        if (!isCreateTeamOpen) {
            clearError();
        }
    }, [isCreateTeamOpen, clearError]);

    return {
        form,
        onSubmit: handleSubmit(onSubmit),
        isLoading,
        error,
        isCreateTeamOpen,
        setIsCreateTeamOpen,
    };
};
