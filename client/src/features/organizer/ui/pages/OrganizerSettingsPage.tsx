import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Tag, Briefcase, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/FileUpload";

import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import {
    useUpdateOrgMutation,
    useDeleteOrgMutation
} from "@/features/organizer/hooks/useOrganizerMutations";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { OrgSettingsFormSchema, orgSettingsSchema } from "../../lib/orgSchemas";
import { prepareOrgUpdateFormData } from "../../lib/orgUtils";

// New sub-components
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { SocialLinksForm } from "../components/SocialLinksForm";
import { DangerZone } from "../components/DangerZone";

const OrganizerSettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { can } = useAccess();

    const updateMutation = useUpdateOrgMutation();
    const deleteMutation = useDeleteOrgMutation();

    const { data: orgData } = useGetOrgByIdQuery(
        user?.orgId as string,
        undefined,
        undefined,
        undefined,
        { enabled: !!user?.orgId }
    );
    const currentOrg = orgData?.data;

    const defaultValues: Partial<OrgSettingsFormSchema> = {
        name: "",
        region: "",
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

    const { reset, watch, setValue, handleSubmit, formState: { isDirty } } = form;

    useEffect(() => {
        if (currentOrg) {
            reset({
                name: currentOrg.name || "",
                region: currentOrg.region || "",
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
        }
    }, [currentOrg, reset]);

    const canUpdate = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.updateOrg]);
    const canDelete = can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.deleteOrg]);

    const onSubmit = async (values: OrgSettingsFormSchema) => {
        if (!currentOrg?._id) return;

        const data = prepareOrgUpdateFormData(values);

        updateMutation.mutate(
            { orgId: currentOrg._id, data },
            {
                onSuccess: () => {
                    toast.success("Organization updated successfully");
                    setValue("image", undefined);
                    setValue("banner", undefined);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to update organization");
                }
            }
        );
    };

    const handleDelete = async () => {
        if (!currentOrg?._id) return;

        deleteMutation.mutate(currentOrg._id, {
            onSuccess: () => {
                toast.success("Organization deleted successfully");
                navigate("/");
            },
            onError: (error) => {
                toast.error(error.message || "Failed to delete organization");
            }
        });
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
                                        control={form.control}
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
                            <ProfileInfoForm disabled={!canUpdate} />

                            {/* Social Links Form */}
                            <SocialLinksForm disabled={!canUpdate} />

                            {/* Save Button (Conditional) */}
                            {canUpdate && isDirty && (
                                <Card className="bg-[#0B0C1A] border-white/5 shadow-xl overflow-hidden">
                                    <CardFooter className="py-4 border-t border-white/5 flex justify-end gap-3 sticky bottom-4 z-10 animate-in slide-in-from-bottom-4 duration-300">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => reset()}
                                            disabled={updateMutation.isPending}
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-6 font-bold"
                                        >
                                            Cancel
                                            <X className="size-4 ml-2" />
                                        </Button>
                                        <Button type="submit" disabled={updateMutation.isPending} className="bg-purple-600 hover:bg-purple-500 text-white px-10 font-bold transition-all shadow-lg shadow-purple-900/40 active:scale-95">
                                            {updateMutation.isPending ? (
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
                                </Card>
                            )}

                            {/* Danger Zone */}
                            {canDelete && (
                                <DangerZone
                                    orgName={currentOrg?.name}
                                    onDelete={handleDelete}
                                    isDeleting={deleteMutation.isPending}
                                />
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default OrganizerSettingsPage;
