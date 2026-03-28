import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema, TeamForm } from "../lib/validation";
import { Team } from "../lib/types";
import { TeamRegion } from "../lib/constants";

export const useTeamSettingsForm = (currentTeam: Team | null) => {
    const form = useForm<TeamForm>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            teamName: "",
            tag: "",
            bio: "",
            region: "INDIA",
            isRecruiting: false,
            twitter: "",
            discord: "",
            youtube: "",
            instagram: "",
            image: null,
            banner: null,
        },
    });

    const { isDirty, isSubmitting } = form.formState;

    useEffect(() => {
        if (currentTeam && !isDirty && !isSubmitting) {
            form.reset({
                teamName: currentTeam.teamName || "",
                tag: currentTeam.tag || "",
                bio: currentTeam.bio || "",
                region: (currentTeam.region as TeamRegion) || "INDIA",
                isRecruiting: currentTeam.isRecruiting || false,
                twitter: currentTeam.socialLinks?.twitter || "",
                discord: currentTeam.socialLinks?.discord || "",
                youtube: currentTeam.socialLinks?.youtube || "",
                instagram: currentTeam.socialLinks?.instagram || "",
                image: null,
                banner: null,
            });
        }
    }, [currentTeam, form, isDirty, isSubmitting]);

    const handleReset = () => {
        if (currentTeam) {
            form.reset({
                teamName: currentTeam.teamName || "",
                tag: currentTeam.tag || "",
                bio: currentTeam.bio || "",
                region: (currentTeam.region as TeamRegion) || "INDIA",
                isRecruiting: currentTeam.isRecruiting || false,
                twitter: currentTeam.socialLinks?.twitter || "",
                discord: currentTeam.socialLinks?.discord || "",
                youtube: currentTeam.socialLinks?.youtube || "",
                instagram: currentTeam.socialLinks?.instagram || "",
                image: null,
                banner: null,
            });
        }
    };

    return { form, isDirty, handleReset };
};
