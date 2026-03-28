import { Navigate } from "react-router-dom";
import { Settings, LayoutDashboard, Briefcase } from "lucide-react";

import { Form } from "@/components/ui/form";

import { ProfileSettingsPreview } from "@/components/shared/profile/ProfileSettingsPreview";
import { RecruitmentStatusSection } from "@/components/shared/profile/RecruitmentStatusSection";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { DeleteTeamSection } from "../components/dialogs/DeleteTeamSection";
import { TeamPageHeader } from "../components/common/TeamPageHeader";
import { TeamForm } from "@/features/teams/lib/validation";
import { SettingsFormActions } from "@/components/shared/forms/SettingsFormActions";
import { SocialConnectionsSection } from "@/components/shared/profile/SocialConnectionsSection";
import { GeneralInfoSection, FieldConfig } from "@/components/shared/profile/GeneralInfoSection";
import { BioSection } from "@/components/shared/profile/BioSection";
import { useTeamSettings } from "../../hooks/useTeamSettings";
import { TEAM_REGIONS } from "../../lib/constants";

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
        options: TEAM_REGIONS.map(reg => ({ label: reg, value: reg })),
    },
];

const TeamSettings = () => {
    const {
        form,
        currentTeam,
        permissions,
        isLoading,
        canManageSettings,
        onSubmit,
        handleReset,
        isDirty,
    } = useTeamSettings();

    const { watch } = form;

    if (!currentTeam) return null;

    if (!canManageSettings && !isLoading) {
        return <Navigate to={TEAM_ROUTES.DASHBOARD} replace />;
    }

    const { isOwner } = permissions;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <Form {...form}>
                <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
                    <TeamPageHeader
                        icon={Settings}
                        title="Team Settings"
                        subtitle="Manage your team's identity and professional presence"
                        noMargin={true}
                        actions={
                            <SettingsFormActions
                                isDirty={isDirty}
                                isLoading={isLoading}
                                onReset={handleReset}
                            />
                        }
                    />

                    <main className="flex-1 overflow-y-auto w-full px-4 md:px-6 pt-2 md:pt-4 pb-4 md:pb-8 space-y-8">
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

                        {isOwner && (
                            <div className="pt-4 mt-8 border-t border-red-500/10">
                                <DeleteTeamSection teamId={currentTeam._id} />
                            </div>
                        )}
                    </main>
                </form>
            </Form>
        </div>
    );
};

export default TeamSettings;
