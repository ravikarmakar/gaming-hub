
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

import { Form } from "@/components/ui/form";

import { useCurrentUser } from "@/features/auth";
import { useUpdateProfileMutation } from "@/features/auth";
import { playerSettingsSchema, PlayerSettingsValues } from "@/features/player/lib/playerSchema";
import { ProfileSettingsPreview } from "@/components/shared/profile/ProfileSettingsPreview";
import { RecruitmentStatusSection } from "@/components/shared/profile/RecruitmentStatusSection";
import { Search } from "lucide-react";
import { SocialConnectionsSection } from "@/components/shared/profile/SocialConnectionsSection";
import { GeneralInfoSection, FieldConfig } from "@/components/shared/profile/GeneralInfoSection";
import { BioSection } from "@/components/shared/profile/BioSection";
import { PersonalDetailsSection } from "@/components/shared/profile/PersonalDetailsSection";
import { SettingsFormActions } from "@/components/shared/forms/SettingsFormActions";

const profileFields: FieldConfig<PlayerSettingsValues>[] = [
  {
    name: "username",
    label: "Username",
    placeholder: "Enter your grid tag",
  },
  {
    name: "esportsRole",
    label: "Esports Role",
    type: "select" as const,
    placeholder: "Select a spec",
    options: ["player", "rusher", "sniper", "igl", "support", "coach"].map(role => ({ label: role, value: role })),
  },
  {
    name: "region",
    label: "Region",
    type: "select" as const,
    placeholder: "Select your active node",
    options: ["GLOBAL", "NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA"].map(reg => ({ label: reg, value: reg })),
  },
];

export const ProfileSettingsForm: React.FC = () => {
  const { user } = useCurrentUser();
  const { mutateAsync: updateProfile, error: updateError } = useUpdateProfileMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlayerSettingsValues>({
    resolver: zodResolver(playerSettingsSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
      esportsRole: user?.esportsRole || "player",
      region: user?.region || "GLOBAL",
      country: user?.country || "",
      isLookingForTeam: user?.isLookingForTeam ?? true,
      gameIgn: user?.gameIgn || "",
      gameUid: user?.gameUid || "",
      gender: user?.gender || "prefer_not_to_say",
      phoneNumber: user?.phoneNumber || "",
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
      socialLinks: {
        discord: user?.socialLinks?.discord || "",
        twitter: user?.socialLinks?.twitter || "",
        instagram: user?.socialLinks?.instagram || "",
        youtube: user?.socialLinks?.youtube || "",
        website: user?.socialLinks?.website || "",
      },
      avatar: null,
      coverImage: null
    },
  });

  const { isDirty } = form.formState;
  const avatarValue = form.watch("avatar");
  const coverValue = form.watch("coverImage");
  const hasImageChanges = !!(avatarValue || coverValue);
  const showButtons = isDirty || hasImageChanges;

  const onReset = () => {
    form.reset();
    form.setValue("avatar", null as any);
    form.setValue("coverImage", null as any);
  };
  const onSubmit = async (values: PlayerSettingsValues) => {
    const submitValues = {
      username: values.username,
      bio: values.bio || "",
      esportsRole: values.esportsRole,
      region: values.region,
      country: values.country || "",
      isLookingForTeam: String(values.isLookingForTeam),
      gameIgn: values.gameIgn || "",
      gameUid: values.gameUid || "",
      phoneNumber: values.phoneNumber || "",
      dob: values.dob || null,
      socialLinks: values.socialLinks,
    };

    // Convert to FormData
    const formData = new FormData();
    Object.entries(submitValues).forEach(([key, value]) => {
      if (value !== null && key !== "socialLinks") {
        formData.append(key, value as string);
      }
    });

    // Handle nested social links
    if (submitValues.socialLinks) {
      Object.entries(submitValues.socialLinks).forEach(([platform, url]) => {
        if (url) {
          formData.append(`socialLinks[${platform}]`, url);
        }
      });
    }

    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }
    if (values.coverImage) {
      formData.append("coverImage", values.coverImage);
    }

    setIsSubmitting(true);
    const success = await updateProfile(formData);
    setIsSubmitting(false);

    if (success) {
      toast.success("Profile updated successfully");
      form.reset({ ...values, avatar: null, coverImage: null }); // Clear dirty state and reset image fields
    } else {
      toast.error(updateError?.message || "Failed to update profile");
    }
  };
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Overview (Left Column) */}
            <div className="space-y-6">
              <ProfileSettingsPreview
                control={form.control}
                bannerName="coverImage"
                imageName="avatar"
                currentBannerUrl={user?.coverImage}
                currentImageUrl={user?.avatar}
                name={user?.username}
                tag={user?.esportsRole}
                isVerified={user?.isAccountVerified}
                hideStatus={true}
                canUpdate={true}
                fallbackText={user?.username?.[0]}
              />

              <RecruitmentStatusSection
                control={form.control}
                name="isLookingForTeam"
                title="Player Status"
                label="Looking for Team"
                description="Let teams know you're looking for a new squad to join."
                icon={Search}
                iconColor="text-blue-500"
                accentColor="blue"
              />
            </div>

            {/* Forms (Right 2 Columns) */}
            <div className="md:col-span-2 space-y-8">
              {/* Details Card */}
              <GeneralInfoSection
                control={form.control}
                title="Primary Details"
                description="Your basic information and community presence."
                icon={UserIcon}
                iconColor="text-blue-500"
                fields={profileFields}
              />

              {/* Personal Information */}
              <PersonalDetailsSection
                control={form.control}
                userEmail={user?.email}
              />

              {/* Bio Card */}
              <BioSection
                control={form.control}
                name="bio"
                title="About You"
                description="Describe yourself and your gaming experience."
                label="Bio"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />

              {/* Social Connections */}
              <SocialConnectionsSection
                control={form.control}
                fields={{
                  discord: "socialLinks.discord",
                  twitter: "socialLinks.twitter",
                  instagram: "socialLinks.instagram",
                  youtube: "socialLinks.youtube",
                  website: "socialLinks.website",
                }}
              />
            </div>
          </div>

          {/* Conditional Action Buttons */}
          <SettingsFormActions
            isDirty={showButtons}
            isLoading={isSubmitting}
            onReset={onReset}
            className="justify-end pt-4"
          />
        </form>
      </Form>
    </div >
  );
};
