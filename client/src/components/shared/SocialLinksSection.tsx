import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Globe, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";

interface SocialLinksSectionProps<T extends FieldValues> {
    control: Control<T>;
    disabled?: boolean;
    // Map of platform to field name in the form
    fields: {
        twitter?: FieldPath<T>;
        discord?: FieldPath<T>;
        youtube?: FieldPath<T>;
        instagram?: FieldPath<T>;
        website?: FieldPath<T>;
    };
}

export function SocialLinksSection<T extends FieldValues>({
    control,
    disabled,
    fields,
}: SocialLinksSectionProps<T>) {
    return (
        <FormSection
            title="Social Presence"
            description="Connect your official social media channels."
            icon={Globe}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {fields.website && (
                    <FormField
                        control={control}
                        name={fields.website}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Website</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            {...field}
                                            className="bg-black/20 border-purple-500/20 text-white pl-10 h-11"
                                            placeholder="https://yourorg.com"
                                            disabled={disabled}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {fields.discord && (
                    <FormField
                        control={control}
                        name={fields.discord}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Discord Invite</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            {...field}
                                            className="bg-black/20 border-purple-500/20 text-white pl-10 h-11"
                                            placeholder="discord.gg/xyz"
                                            disabled={disabled}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {fields.twitter && (
                    <FormField
                        control={control}
                        name={fields.twitter}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Twitter (X)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            {...field}
                                            className="bg-black/20 border-purple-500/20 text-white pl-10 h-11"
                                            placeholder="@YourOrg"
                                            disabled={disabled}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {fields.instagram && (
                    <FormField
                        control={control}
                        name={fields.instagram}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">Instagram</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            {...field}
                                            className="bg-black/20 border-purple-500/20 text-white pl-10 h-11"
                                            placeholder="username"
                                            disabled={disabled}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {fields.youtube && (
                    <FormField
                        control={control}
                        name={fields.youtube}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black text-gray-500 uppercase tracking-widest">YouTube Channel</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Youtube className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            {...field}
                                            className="bg-black/20 border-purple-500/20 text-white pl-10 h-11"
                                            placeholder="YouTube Channel"
                                            disabled={disabled}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>
        </FormSection>
    );
}
