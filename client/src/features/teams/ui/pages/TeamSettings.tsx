import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
    Globe,
    Twitter,
    Instagram,
    Youtube,
    Settings,
    Image as ImageIcon,
    LayoutDashboard,
    Save,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

import FileUpload from "@/components/FileUpload";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TEAM_ACCESS } from "@/features/teams/lib/access";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { DeleteTeamSection } from "../components/DeleteTeamSection";
import { teamSchema, MAX_FILE_SIZE, TeamForm } from "@/features/teams/lib/teamSchema";


const TeamSettings = () => {
    const { updateTeam, isLoading, currentTeam } = useTeamStore();
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
        },
    });

    // Sync form with currentTeam data
    useEffect(() => {
        if (currentTeam) {
            form.reset({
                teamName: currentTeam.teamName || "",
                tag: currentTeam.tag || "",
                bio: currentTeam.bio || "",
                region: (currentTeam.region as any) || "INDIA",
                isRecruiting: currentTeam.isRecruiting || false,
                twitter: currentTeam.socialLinks?.twitter || "",
                discord: currentTeam.socialLinks?.discord || "",
                youtube: currentTeam.socialLinks?.youtube || "",
                instagram: currentTeam.socialLinks?.instagram || "",
            });
        }
    }, [currentTeam, form]);

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

        const result = await updateTeam(formData);
        if (result) {
            toast.success("Team settings updated successfully!");
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
                region: (currentTeam.region as any) || "INDIA",
                isRecruiting: currentTeam.isRecruiting || false,
                twitter: currentTeam.socialLinks?.twitter || "",
                discord: currentTeam.socialLinks?.discord || "",
                youtube: currentTeam.socialLinks?.youtube || "",
                instagram: currentTeam.socialLinks?.instagram || "",
            });
            toast.success("Changes reset locally");
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
                    <div className="flex flex-col mb-8 md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 border rounded-lg bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <Settings className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Team Settings</h1>
                                <p className="text-sm text-gray-400">Manage your team's identity and professional presence</p>
                            </div>
                        </div>

                        {form.formState.isDirty && (
                            <div className="flex items-center gap-3 duration-300 animate-in fade-in slide-in-from-right-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-gray-400 transition-all border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10"
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/50 min-w-[120px] transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Branding Section */}
                    <Card className="bg-[#0F111A]/60 border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <ImageIcon className="w-5 h-5 text-purple-400" />
                                Branding & Visuals
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Update your team logo and banner to stand out
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="space-y-4">
                                            <Label className="text-gray-300">Team Logo</Label>
                                            <FormControl>
                                                <FileUpload
                                                    variant="avatar"
                                                    value={field.value || currentTeam?.imageUrl}
                                                    onChange={field.onChange}
                                                    maxSize={MAX_FILE_SIZE}
                                                    fallbackText={currentTeam?.teamName?.[0]}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="banner"
                                    render={({ field }) => (
                                        <div className="space-y-4">
                                            <Label className="text-gray-300">Team Banner</Label>
                                            <FormControl>
                                                <FileUpload
                                                    variant="banner"
                                                    value={field.value || currentTeam?.bannerUrl}
                                                    onChange={field.onChange}
                                                    maxSize={MAX_FILE_SIZE}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Information */}
                    <Card className="bg-[#0F111A]/60 border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <LayoutDashboard className="w-5 h-5 text-purple-400" />
                                General Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                                    className="text-white bg-black/20 border-purple-500/20 placeholder:text-gray-600 focus:border-purple-500/50"
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
                                                    className="uppercase text-white bg-black/20 border-purple-500/20 placeholder:text-gray-600 focus:border-purple-500/50"
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
                                                className="text-white bg-black/20 border-purple-500/20 placeholder:text-gray-600 focus:border-purple-500/50"
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
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card className="bg-[#0F111A]/60 border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Globe className="w-5 h-5 text-purple-400" />
                                Social Presence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="twitter"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <Twitter className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Twitter URL"
                                                    className="pl-10 text-white bg-black/20 border-purple-500/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discord"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <Badge variant="outline" className="mr-2 border-purple-500/20 text-gray-400 absolute left-1 top-2.5 h-6 scale-75">
                                                #
                                            </Badge>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Discord Invite Link"
                                                    className="pl-10 text-white bg-black/20 border-purple-500/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="youtube"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <Youtube className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="YouTube Channel"
                                                    className="pl-10 text-white bg-black/20 border-purple-500/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="instagram"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <Instagram className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Instagram Profile"
                                                    className="pl-10 text-white bg-black/20 border-purple-500/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
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
