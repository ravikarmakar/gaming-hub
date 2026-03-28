import toast from "react-hot-toast";
import { useUpdateTeamMutation } from "./useTeamMutations";
import { TeamForm } from "../lib/validation";
import { UseFormReturn } from "react-hook-form";

export const useTeamSettingsUpdate = (teamId: string, form: UseFormReturn<TeamForm>) => {
    const updateMutation = useUpdateTeamMutation();

    const updateSettings = async (data: TeamForm) => {
        const formData = new FormData();
        formData.append("teamName", data.teamName);
        formData.append("tag", data.tag);
        if (data.bio) formData.append("bio", data.bio);
        formData.append("region", data.region);
        formData.append("isRecruiting", String(data.isRecruiting));

        if (data.twitter) formData.append("twitter", data.twitter);
        if (data.discord) formData.append("discord", data.discord);
        if (data.youtube) formData.append("youtube", data.youtube);
        if (data.instagram) formData.append("instagram", data.instagram);

        if (data.image instanceof File) formData.append("image", data.image);
        if (data.banner instanceof File) formData.append("banner", data.banner);

        try {
            await updateMutation.mutateAsync({ teamId, data: formData }, {
                onSuccess: (result: any) => {
                    toast.success("Team settings updated successfully!");
                    form.reset({
                        teamName: result.teamName || "",
                        tag: result.tag || "",
                        bio: result.bio || "",
                        region: result.region || data.region,
                        isRecruiting: result.isRecruiting || false,
                        twitter: result.socialLinks?.twitter || "",
                        discord: result.socialLinks?.discord || "",
                        youtube: result.socialLinks?.youtube || "",
                        instagram: result.socialLinks?.instagram || "",
                        image: null,
                        banner: null,
                    });
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to update team settings");
                }
            });
        } catch (error) {
            // Error is handled by onError callback, but we catch it here to prevent unhandled rejection
        }
    };

    return { updateSettings, isUpdating: updateMutation.isPending };
};
