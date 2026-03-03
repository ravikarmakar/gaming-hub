import { Globe, MessageCircle, Twitter, Instagram } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OrgSettingsFormSchema } from "../../lib/orgSchemas";

interface SocialLinksFormProps {
    disabled?: boolean;
}

export const SocialLinksForm = ({ disabled }: SocialLinksFormProps) => {
    const { control } = useFormContext<OrgSettingsFormSchema>();

    return (
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
                                            disabled={disabled}
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
                                            disabled={disabled}
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
                                            disabled={disabled}
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
                                            disabled={disabled}
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
        </Card>
    );
};
