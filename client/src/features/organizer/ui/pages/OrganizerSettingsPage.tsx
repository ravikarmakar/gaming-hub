import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Trash2,
    Save,
    AlertTriangle,
    Building2,
    Mail,
    Tag,
    Globe,
    MessageCircle,
    Twitter,
    Instagram,
    Briefcase,
    X,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/FileUpload";

import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { OrgSettingsFormSchema, orgSettingsSchema } from "../../lib/orgSchemas";

const OrganizerSettingsPage = () => {
    const navigate = useNavigate();
    const { currentOrg, updateOrg, deleteOrg, isLoading, error, getOrgById } = useOrganizerStore();
    const { user } = useAuthStore();
    const { can } = useAccess();

    // Initial values based on currentOrg
    const defaultValues: Partial<OrgSettingsFormSchema> = {
        name: "",
        email: "",
        tag: "",
        description: "",
        isHiring: false,
        socialLinks: {
            discord: "",
            twitter: "",
            website: "",
            instagram: "",
            youtube: "",
        }
    };

    const form = useForm<OrgSettingsFormSchema>({
        resolver: zodResolver(orgSettingsSchema),
        defaultValues,
        mode: "onChange",
    });

    const { reset, watch, setValue, control, handleSubmit, formState: { isDirty } } = form;

    // Reset form when currentOrg loads
    useEffect(() => {
        if (currentOrg) {
            reset({
                name: currentOrg.name || "",
                email: currentOrg.email || "",
                tag: currentOrg.tag || "",
                description: currentOrg.description || "",
                isHiring: currentOrg.isHiring || false,
                socialLinks: {
                    discord: currentOrg.socialLinks?.discord || "",
                    twitter: currentOrg.socialLinks?.twitter || "",
                    website: currentOrg.socialLinks?.website || "",
                    instagram: currentOrg.socialLinks?.instagram || "",
                    youtube: currentOrg.socialLinks?.youtube || "",
                },
                image: undefined,
                banner: undefined
            });
        } else {
            // Fetch org if missing
            if (user?.orgId) {
                getOrgById(user.orgId);
            }
        }
    }, [currentOrg, reset, user?.orgId, getOrgById]);

    // RBAC
    const canUpdate = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateOrg]);
    const canDelete = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.deleteOrg]);

    const onSubmit = async (values: OrgSettingsFormSchema) => {
        if (!currentOrg?._id) return;

        const data = new FormData();
        data.append("name", values.name);
        data.append("email", values.email);
        data.append("tag", values.tag);
        if (values.description) data.append("description", values.description);
        data.append("isHiring", String(values.isHiring));
        data.append("socialLinks", JSON.stringify(values.socialLinks));

        if (values.image instanceof File) {
            data.append("image", values.image);
        }
        if (values.banner instanceof File) {
            data.append("banner", values.banner);
        }

        const success = await updateOrg(data);
        if (success) {
            toast.success("Organization updated successfully");
            // Refresh org data
            await getOrgById(currentOrg._id);
            // Reset file inputs specifically since they are consumed
            setValue("image", undefined);
            setValue("banner", undefined);
        } else {
            toast.error(error || "Failed to update organization");
        }
    };

    const handleDelete = async () => {
        if (!currentOrg?._id) return;

        const success = await deleteOrg();
        if (success) {
            toast.success("Organization deleted successfully");
            navigate("/");
        } else {
            toast.error(error || "Failed to delete organization");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    Organizer Settings
                </h1>
                <p className="text-gray-400">Manage your organizer's identity, recruitment status, and social presence.</p>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="contents">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Overview (Left Column) */}
                        <div className="space-y-6">
                            <Card className="bg-transparent border-white/5 h-fit overflow-hidden">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="banner"
                                        render={({ field }) => (
                                            <FileUpload
                                                variant="banner"
                                                value={field.value || currentOrg?.bannerUrl}
                                                onChange={field.onChange}
                                                disabled={!canUpdate}
                                                label="Change Banner"
                                            />
                                        )}
                                    />
                                </div>
                                <CardHeader className="text-center -mt-16 overflow-visible">
                                    <div className="relative mx-auto mb-4">
                                        <FormField
                                            control={form.control}
                                            name="image"
                                            render={({ field }) => (
                                                <FileUpload
                                                    variant="avatar"
                                                    value={field.value || currentOrg?.imageUrl}
                                                    onChange={field.onChange}
                                                    disabled={!canUpdate}
                                                    fallbackText={currentOrg?.name?.[0]}
                                                />
                                            )}
                                        />
                                    </div>
                                    <CardTitle className="text-white text-xl">{currentOrg?.name}</CardTitle>
                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                                            <Tag className="size-3 mr-1" /> {currentOrg?.tag}
                                        </Badge>
                                        {watch("isHiring") && (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                <Briefcase className="size-3 mr-1" /> Is Hiring
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="space-y-2 text-sm">
                                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Ownership</p>
                                        <p className="text-gray-300 flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-purple-500" /> Owner Account
                                        </p>
                                    </div>
                                    <div className="space-y-2 text-sm pt-2">
                                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Verification</p>
                                        {currentOrg?.isVerified ? (
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Verified Partner</Badge>
                                        ) : (
                                            <p className="text-gray-500">Not verified</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recruitment Status */}
                            <Card className="bg-[#0B0C1A] border-white/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-white text-sm flex items-center gap-2 uppercase tracking-widest text-gray-400">
                                        <Briefcase className="size-4 text-emerald-400" /> Recruitment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={control}
                                        name="isHiring"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-colors hover:bg-emerald-500/10 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={!canUpdate}
                                                        className="border-emerald-500/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                                                    />
                                                </FormControl>
                                                <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => canUpdate && field.onChange(!field.value)}>
                                                    <FormLabel className="text-sm font-bold text-emerald-400 leading-none cursor-pointer">
                                                        Open for Hiring
                                                    </FormLabel>
                                                    <FormDescription className="text-xs text-gray-500">
                                                        Let players know you're looking for new staff.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Forms (Right 2 Columns) */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Information Form */}
                            <Card className="bg-[#0B0C1A] border-white/5 shadow-xl">
                                <CardHeader className="border-b border-white/5 pb-4">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Building2 className="size-5 text-purple-500" /> Organization Profile
                                    </CardTitle>
                                    <CardDescription>Update your public identity and contact information.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Brand Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 h-11"
                                                            placeholder="e.g. Pro Gaming League"
                                                            disabled={!canUpdate}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="tag"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Public Tag</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 h-11"
                                                            placeholder="e.g. PGL"
                                                            disabled={!canUpdate}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Official Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            {...field}
                                                            className="bg-white/5 border-white/10 text-white pl-10 focus:ring-purple-500 focus:border-purple-500 h-11"
                                                            placeholder="admin@yourorg.com"
                                                            disabled={!canUpdate}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Biography</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="bg-white/5 border-white/10 text-white min-h-[140px] focus:ring-purple-500 focus:border-purple-500 resize-none leading-relaxed"
                                                        placeholder="Tell participants about your mission, history, and goals..."
                                                        disabled={!canUpdate}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Social Links Form */}
                            <Card className="bg-[#0B0C1A] border-white/5 shadow-xl">
                                <CardHeader className="border-b border-white/5 pb-4">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Globe className="size-5 text-blue-400" /> Social Presence
                                    </CardTitle>
                                    <CardDescription>Connect your official social media channels.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={control}
                                            name="socialLinks.website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Website</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                {...field}
                                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                                placeholder="https://yourorg.com"
                                                                disabled={!canUpdate}
                                                                value={field.value || ""}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="socialLinks.discord"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Discord Invite</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                {...field}
                                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                                placeholder="discord.gg/xyz"
                                                                disabled={!canUpdate}
                                                                value={field.value || ""}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="socialLinks.twitter"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Twitter (X)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                {...field}
                                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                                placeholder="@YourOrg"
                                                                disabled={!canUpdate}
                                                                value={field.value || ""}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="socialLinks.instagram"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Instagram</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                {...field}
                                                                className="bg-white/5 border-white/10 text-white pl-10 h-11"
                                                                placeholder="username"
                                                                disabled={!canUpdate}
                                                                value={field.value || ""}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                {canUpdate && isDirty && (
                                    <CardFooter className="pt-4 pb-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-4 z-10 animate-in slide-in-from-bottom-4 duration-300">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => reset()}
                                            disabled={isLoading}
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-6 font-bold"
                                        >
                                            Cancel
                                            <X className="size-4 ml-2" />
                                        </Button>
                                        <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-500 text-white px-10 font-bold transition-all shadow-lg shadow-purple-900/40 active:scale-95">
                                            {isLoading ? (
                                                <>
                                                    Saving...
                                                    <Loader2 className="size-4 ml-2 animate-spin" />
                                                </>
                                            ) : (
                                                <>
                                                    Save Settings
                                                    <Save className="size-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>

                            {/* Danger Zone */}
                            {canDelete && (
                                <Card className="border-red-500/20 bg-red-500/5 shadow-inner">
                                    <CardHeader>
                                        <CardTitle className="text-red-400 flex items-center gap-2">
                                            <AlertTriangle className="size-5" /> Account Safety
                                        </CardTitle>
                                        <CardDescription className="text-red-400/60 font-medium">Permanently dissolve your organization and remove its presence.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-red-300/60 mb-6 leading-relaxed bg-red-950/20 p-4 rounded-lg border border-red-500/10">
                                            <strong className="text-red-400">Warning:</strong> Dissolving this organization will terminate all hosted events, revoke staff credentials, and purge your metrics. This metadata cannot be recovered.
                                        </p>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white font-black px-8">
                                                    Terminate Organization
                                                    <Trash2 className="size-4 ml-2" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-[#0F0720] border-red-500/20 text-white shadow-2xl max-w-lg">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-2xl font-black text-red-400">Irreversible Action</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-400 py-2">
                                                        You are about to dissolve <span className="text-white font-bold bg-white/5 px-2 py-1 rounded">"{currentOrg?.name}"</span>.
                                                        This will permanently erase all history, events, and rosters associated with this organization.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-3 mt-4">
                                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold">Abandon</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-black px-10">
                                                        Dissolve Now
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default OrganizerSettingsPage;
