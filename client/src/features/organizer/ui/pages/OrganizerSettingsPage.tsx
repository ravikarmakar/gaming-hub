import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    Form,
} from "@/components/ui/form";
import { ProfileSettingsPreview } from "@/components/shared/profile/ProfileSettingsPreview";

import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import {
    useUpdateOrgMutation,
    useDeleteOrgMutation
} from "@/features/organizer/hooks/useOrganizerMutations";
import { useCurrentUser } from "@/features/auth";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "../../lib/access";
import { useAccess } from "@/features/auth/hooks/use-access";
import { OrgSettingsFormSchema, orgSettingsSchema } from "../../lib/orgSchemas";
import { prepareOrgUpdateFormData } from "../../lib/orgUtils";

// New sub-components
import { GeneralInfoSection, FieldConfig } from "@/components/shared/profile/GeneralInfoSection";
import { BioSection } from "@/components/shared/profile/BioSection";
import { DangerZone } from "../components/DangerZone";
import { SettingsFormActions } from "@/components/shared/forms/SettingsFormActions";
import { SocialConnectionsSection } from "@/components/shared/profile/SocialConnectionsSection";
import { RecruitmentStatusSection } from "@/components/shared/profile/RecruitmentStatusSection";

const orgFields = (canUpdate: boolean): FieldConfig<OrgSettingsFormSchema>[] => [
    {
        name: "name",
        label: "Brand Name",
        placeholder: "e.g. Pro Gaming League",
        disabled: !canUpdate,
    },
    {
        name: "tag",
        label: "Public Tag",
        placeholder: "e.g. PGL",
        disabled: !canUpdate,
        maxLength: 5,
    },
    {
        name: "region",
        label: "Region",
        type: "select" as const,
        placeholder: "Select a region",
        options: [
            { label: "NA - North America", value: "NA" },
            { label: "EU - Europe", value: "EU" },
            { label: "ASIA - Asia", value: "ASIA" },
            { label: "SEA - SE Asia", value: "SEA" },
            { label: "SA - South America", value: "SA" },
            { label: "OCE - Oceania", value: "OCE" },
            { label: "MENA - Middle East & North Africa", value: "MENA" },
            { label: "INDIA - India", value: "INDIA" },
            { label: "Global Node", value: "GLOBAL" }
        ],
        disabled: !canUpdate,
    }
];

export const OrganizerSettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useCurrentUser();
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
                            <ProfileSettingsPreview
                                control={form.control}
                                bannerName="banner"
                                imageName="image"
                                currentBannerUrl={currentOrg?.bannerUrl}
                                currentImageUrl={currentOrg?.imageUrl}
                                name={currentOrg?.name}
                                tag={currentOrg?.tag}
                                isHiring={watch("isHiring")}
                                isVerified={currentOrg?.isVerified}
                                canUpdate={canUpdate}
                                fallbackText={currentOrg?.name?.[0]}
                            />

                            {/* Recruitment Status */}
                            <RecruitmentStatusSection
                                control={form.control}
                                name="isHiring"
                                title="Recruitment"
                                label="Open for Hiring"
                                description="Let players know you're looking for new staff."
                                icon={Briefcase}
                                iconColor="text-emerald-400"
                                accentColor="emerald"
                                disabled={!canUpdate}
                            />
                        </div>

                        {/* Forms (Right 2 Columns) */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Information Form */}
                            <GeneralInfoSection
                                control={form.control}
                                title="Organization Profile"
                                description="Update your public identity and contact information."
                                icon={Building2}
                                iconColor="text-purple-500"
                                gridClassName="grid-cols-1 md:grid-cols-2"
                                fields={orgFields(canUpdate)}
                            />

                            <BioSection
                                control={form.control}
                                name="description"
                                title="Biography"
                                description="Tell participants about your mission, history, and goals."
                                label="Description"
                                placeholder="Tell us about yourself..."
                                disabled={!canUpdate}
                                maxLength={1000}
                            />

                            {/* Social Links Form */}
                            <SocialConnectionsSection
                                control={form.control}
                                disabled={!canUpdate}
                                fields={{
                                    website: "socialLinks.website",
                                    discord: "socialLinks.discord",
                                    twitter: "socialLinks.twitter",
                                    instagram: "socialLinks.instagram",
                                    youtube: "socialLinks.youtube"
                                }}
                            />

                            {/* Save Button (Conditional) */}
                            {canUpdate && (
                                <SettingsFormActions
                                    isDirty={isDirty}
                                    isLoading={updateMutation.isPending}
                                    onReset={() => reset()}
                                    saveLabel="Save Settings"
                                    className="sticky bottom-4 z-10 p-4 bg-[#0B0C1A] border border-white/5 rounded-xl shadow-xl justify-end"
                                />
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
