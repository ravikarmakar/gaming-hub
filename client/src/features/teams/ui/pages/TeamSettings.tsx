import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Settings, LayoutDashboard, Briefcase } from "lucide-react";

import { Form } from "@/components/ui/form";

import { ProfileSettingsPreview } from "@/components/shared/profile/ProfileSettingsPreview";
import { RecruitmentStatusSection } from "@/components/shared/profile/RecruitmentStatusSection";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TEAM_ACCESS } from "@/features/teams/lib/access";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { DeleteTeamSection } from "../components/DeleteTeamSection";
import { TeamPageHeader } from "../components/TeamPageHeader";
import { teamSchema, TeamForm } from "@/features/teams/lib/teamSchema";
import { SettingsFormActions } from "@/components/shared/SettingsFormActions";
import { SocialConnectionsSection } from "@/components/shared/profile/SocialConnectionsSection";
import { GeneralInfoSection, FieldConfig } from "@/components/shared/profile/GeneralInfoSection";
import { BioSection } from "@/components/shared/profile/BioSection";

const teamFields: FieldConfig<TeamForm>[] = [
    {
        name: "teamName",
        label: "Team Name",
        placeholder: "Team Name",
    },
    {
        name: "tag",
        label: "Team Tag",
        placeholder: "TAG",
        maxLength: 5,
    },
    {
        name: "region",
        label: "Region",
        type: "select" as const,
        placeholder: "Select region",
        options: ["NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA", "GLOBAL"].map(reg => ({ label: reg, value: reg })),
    },
];

const TeamSettings = () => {
    const { updateTeam, isLoading, currentTeam, getTeamById } = useTeamManagementStore();
    const { user } = useAuthStore();
    const { can } = useAccess();

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

    // Sync form with currentTeam data
    // Only reset if form is not dirty to prevent "blinking" while editing
    // due to background refreshes or socket/revalidation events
    useEffect(() => {
        if (currentTeam && !isDirty && !isSubmitting) {
            form.reset({
                teamName: currentTeam.teamName || "",
                tag: currentTeam.tag || "",
                bio: currentTeam.bio || "",
                region: currentTeam.region || "INDIA",
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

    const { watch } = form;

    const onSubmit = async (data: TeamForm) => {
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

        if (!currentTeam) return;
        const result = await updateTeam(currentTeam._id, formData);
        if (result) {
            toast.success("Team settings updated successfully!");
            // Mark current values as clean baseline
            form.reset({
                teamName: result.teamName || "",
                tag: result.tag || "",
                bio: result.bio || "",
                region: result.region || "INDIA",
                isRecruiting: result.isRecruiting || false,
                twitter: result.socialLinks?.twitter || "",
                discord: result.socialLinks?.discord || "",
                youtube: result.socialLinks?.youtube || "",
                instagram: result.socialLinks?.instagram || "",
                image: null,
                banner: null,
            });
            // Force refresh team data to ensure other components are in sync
            await getTeamById(currentTeam._id, true);
        } else {
            toast.error("Failed to update team settings");
        }
    };

    const handleReset = () => {
        if (currentTeam) {
            form.reset({
                teamName: currentTeam.teamName || "",
                tag: currentTeam.tag || "",
                bio: currentTeam.bio || "",
                region: currentTeam.region || "INDIA",
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

    const canManageSettings = can(TEAM_ACCESS.settings);

    if (!currentTeam) return null;

    if (!canManageSettings && !isLoading) {
        return <Navigate to={TEAM_ROUTES.DASHBOARD} replace />;
    }

    const isOwner = currentTeam?.captain?.toString() === user?._id?.toString();

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <TeamPageHeader
                        icon={Settings}
                        title="Team Settings"
                        subtitle="Manage your team's identity and professional presence"
                        actions={
                            <SettingsFormActions
                                isDirty={isDirty}
                                isLoading={isLoading}
                                onReset={handleReset}
                            />
                        }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Overview (Left Column) */}
                        <div className="space-y-6">
                            <ProfileSettingsPreview
                                control={form.control}
                                bannerName="banner"
                                imageName="image"
                                currentBannerUrl={currentTeam?.bannerUrl}
                                currentImageUrl={currentTeam?.imageUrl}
                                name={currentTeam?.teamName}
                                tag={currentTeam?.tag}
                                isHiring={watch("isRecruiting")}
                                isVerified={currentTeam?.isVerified}
                                canUpdate={canManageSettings}
                                fallbackText={currentTeam?.teamName?.[0]}
                                ownershipLabel="Team Account"
                            />

                            <RecruitmentStatusSection
                                control={form.control}
                                name="isRecruiting"
                                title="Recruitment"
                                label="Open for Recruitment"
                                description="Allow other players to see you're looking for members."
                                icon={Briefcase}
                                iconColor="text-purple-400"
                                accentColor="purple"
                                disabled={!canManageSettings}
                            />
                        </div>

                        {/* Forms (Right 2 Columns) */}
                        <div className="md:col-span-2 space-y-6">
                            <GeneralInfoSection
                                control={form.control}
                                title="General Information"
                                description="Update your team's public identity and headquarters."
                                icon={LayoutDashboard}
                                iconColor="text-blue-500"
                                gridClassName="grid-cols-1 md:grid-cols-2"
                                fields={teamFields}
                            />

                            <BioSection
                                control={form.control}
                                name="bio"
                                title="Team Bio"
                                description="Tell the community about your team's history and goals."
                                label="Description"
                                placeholder="Tell the world about your team..."
                                maxLength={500}
                            />

                            <SocialConnectionsSection
                                control={form.control}
                                fields={{
                                    twitter: "twitter",
                                    discord: "discord",
                                    youtube: "youtube",
                                    instagram: "instagram"
                                }}
                            />
                        </div>
                    </div>
                </form>
            </Form>

            {isOwner && (
                <div className="pt-4 mt-8 border-t border-red-500/10">
                    <DeleteTeamSection />
                </div>
            )}
        </div>
    );
};

export default TeamSettings;
