import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
    Settings,
    LayoutDashboard,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TEAM_ACCESS } from "@/features/teams/lib/access";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { DeleteTeamSection } from "../components/DeleteTeamSection";
import { TeamPageHeader } from "../components/TeamPageHeader";
import { teamSchema, TeamForm } from "@/features/teams/lib/teamSchema";
import { BrandingForm } from "../components/settings/BrandingForm";
import { SettingsFormActions } from "@/components/shared/SettingsFormActions";
import { FormSection } from "@/components/shared/FormSection";
import { SocialLinksSection } from "@/components/shared/SocialLinksSection";

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

                    <BrandingForm control={form.control} currentTeam={currentTeam} />

                    <FormSection
                        title="General Information"
                        icon={LayoutDashboard}
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="teamName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Team Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="text-white bg-black/20 border-purple-500/20 placeholder:text-gray-400 focus:border-purple-500/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Team Tag (Max 5 chars)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                maxLength={5}
                                                className="uppercase text-white bg-black/20 border-purple-500/20 placeholder:text-gray-400 focus:border-purple-500/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Team Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            rows={4}
                                            className="text-white bg-black/20 border-purple-500/20 placeholder:text-gray-400 focus:border-purple-500/50"
                                            placeholder="Tell the world about your team..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Region</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="text-white bg-black/20 border-purple-500/20">
                                                    <SelectValue placeholder="Select region" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#0F111A] border-white/10 text-white">
                                                {["NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA"].map((reg) => (
                                                    <SelectItem key={reg} value={reg} className="focus:bg-purple-500/10 cursor-pointer">{reg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isRecruiting"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-black/20 border-purple-500/10">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-gray-300">Recruitment Status</FormLabel>
                                            <p className="text-xs text-gray-500">Allow other players to see you're looking for members</p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value || false}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    <SocialLinksSection
                        control={form.control}
                        fields={{
                            twitter: "twitter",
                            discord: "discord",
                            youtube: "youtube",
                            instagram: "instagram"
                        }}
                    />
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
