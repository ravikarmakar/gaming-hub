import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, DefaultValues } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";

interface UseCreateGroupProps<TFieldValues extends Record<string, any>> {
    type: "team" | "org";
    schema: z.ZodType<TFieldValues, any, any>;
    defaultValues: TFieldValues;
}

export function useCreateGroup<TFieldValues extends Record<string, any>>({
    type,
    schema,
    defaultValues,
}: UseCreateGroupProps<TFieldValues>) {
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    // Stores
    const {
        isCreateTeamOpen,
        setIsCreateTeamOpen,
    } = useTeamStore();
    const {
        createTeam,
        isLoading: isTeamLoading,
        error: teamError,
        clearError: clearTeamError
    } = useTeamManagementStore();

    const {
        isCreateOrgOpen,
        setIsCreateOrgOpen,
        error: orgError,
        clearError: clearOrgError,
        createOrg,
        isLoading: isOrgLoading
    } = useOrganizerStore();

    const isTeam = type === "team";

    const isOpen = isTeam ? isCreateTeamOpen : isCreateOrgOpen;
    const setIsOpen = isTeam ? setIsCreateTeamOpen : setIsCreateOrgOpen;
    const error = isTeam ? teamError : orgError;
    const clearError = isTeam ? clearTeamError : clearOrgError;
    const isLoading = isTeam ? isTeamLoading : isOrgLoading;

    const form = useForm<TFieldValues>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<TFieldValues>,
    });

    const { handleSubmit, reset } = form;

    const onSubmit = async (data: TFieldValues) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // If it's the tag, make sure it's uppercase. For org, it's uppercase on change, but this ensures safety.
                const finalValue = (key === "tag" && typeof value === "string") ? value.toUpperCase() : value;
                formData.append(key, finalValue as string | Blob);
            }
        });

        let result;
        if (isTeam) {
            result = await createTeam(formData);
        } else {
            result = await createOrg(formData);
        }

        if (result) {
            setIsSuccess(true);
            toast.success(`${isTeam ? "Team" : "Organization"} created successfully!`);

            // Update auth state to get the new teamId/orgId and roles before navigating
            await useAuthStore.getState().checkAuth(true);

            setTimeout(() => {
                setIsSuccess(false);
                setIsOpen(false);
                reset();
                if (isTeam) {
                    navigate(TEAM_ROUTES.DASHBOARD);
                }
            }, 2000);
        } else {
            // Handle error logic: map to specific fields or show as a toast.
            const latestError = isTeam ? useTeamManagementStore.getState().error : useOrganizerStore.getState().error;

            if (latestError) {
                const lowerError = latestError.toLowerCase();
                let isFieldError = false;

                if (lowerError.includes("name already exists") || lowerError.includes("team name") || lowerError.includes("org name") || lowerError.includes("organization name")) {
                    form.setError(isTeam ? "teamName" as any : "name" as any, { type: "server", message: latestError });
                    isFieldError = true;
                } else if (lowerError.includes("tag")) {
                    form.setError("tag" as any, { type: "server", message: latestError });
                    isFieldError = true;
                } else if (lowerError.includes("region")) {
                    form.setError("region" as any, { type: "server", message: latestError });
                    isFieldError = true;
                }

                if (!isFieldError) {
                    toast.error(latestError);
                } else {
                    // Clear the global error since we handled it as a field error
                    clearError();
                }
            } else {
                toast.error(`Failed to create ${isTeam ? "team" : "organization"}`);
            }
        }
    };

    useEffect(() => {
        if (!isOpen) {
            clearError();
        }
    }, [isOpen, clearError]);

    return {
        form,
        onSubmit: handleSubmit(onSubmit as any),
        isLoading,
        error,
        isOpen,
        setIsOpen,
        isSuccess,
    };
}
