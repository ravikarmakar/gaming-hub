import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, DefaultValues } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { getErrorMessage } from "@/lib/utils";
import { useCreateOrgMutation } from "@/features/organizer/hooks/useOrganizerMutations";
import { useCreateTeamMutation } from "@/features/teams/hooks/useTeamMutations";

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
    const [searchParams, setSearchParams] = useSearchParams();

    const isTeam = type === "team";
    const modalKey = isTeam ? "create-team" : "create-org";
    
    const isOpen = searchParams.get("modal") === modalKey;
    const setIsOpen = (open: boolean) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (open) {
                next.set("modal", modalKey);
            } else {
                next.delete("modal");
            }
            return next;
        }, { replace: true });
    };

    const form = useForm<TFieldValues>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<TFieldValues>,
    });
    const { handleSubmit, reset } = form;

    const createTeamMutation = useCreateTeamMutation();
    const createOrgMutation = useCreateOrgMutation();

    const activeMutation = isTeam ? createTeamMutation : createOrgMutation;

    const handleSuccess = async () => {
        setIsSuccess(true);

        // Update auth state to get the new teamId/orgId and roles before navigating
        await useAuthStore.getState().checkAuth(true);

        setTimeout(() => {
            setIsSuccess(false);
            setIsOpen(false);
            reset();
            if (isTeam) {
                navigate(TEAM_ROUTES.DASHBOARD);
            } else {
                navigate(ORGANIZER_ROUTES.DASHBOARD);
            }
        }, 2000);
    };

    const handleError = (error: any) => {
        const latestError = getErrorMessage(error, `Failed to create ${isTeam ? "team" : "organization"}`);
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
        }
    };

    const onSubmit = (data: TFieldValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const finalValue = (key === "tag" && typeof value === "string") ? value.toUpperCase() : value;
                formData.append(key, finalValue as string | Blob);
            }
        });

        activeMutation.mutate(formData, {
            onSuccess: handleSuccess,
            onError: handleError,
        });
    };

    useEffect(() => {
        if (!isOpen) {
            form.clearErrors();
        }
    }, [isOpen, form]);

    return {
        form,
        onSubmit: handleSubmit(onSubmit),
        isLoading: activeMutation.isPending,
        isOpen,
        setIsOpen,
        isSuccess,
    };
}
