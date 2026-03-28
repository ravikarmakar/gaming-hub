import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Share2, Twitter, Instagram, Youtube, Globe } from "lucide-react";

const DiscordIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9459 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
    </svg>
);

import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SocialConnectionsSectionProps<T extends FieldValues> {
    control: Control<T>;
    title?: string;
    description?: string;
    fields: {
        discord?: FieldPath<T>;
        twitter?: FieldPath<T>;
        instagram?: FieldPath<T>;
        youtube?: FieldPath<T>;
        website?: FieldPath<T>;
    };
    disabled?: boolean;
}

export function SocialConnectionsSection<T extends FieldValues>({
    control,
    title = "Social Connections",
    description = "Link your social media profiles to build your community.",
    fields,
    disabled = false
}: SocialConnectionsSectionProps<T>) {
    return (
        <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <Share2 className="w-4 h-4 text-pink-500" />
                    <CardTitle className="text-sm font-black text-white tracking-[2px]">{title}</CardTitle>
                </div>
                <CardDescription className="text-xs text-zinc-400 font-medium">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.discord && (
                        <FormField
                            control={control}
                            name={fields.discord}
                            render={({ field }) => (
                                <FormItem className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 uppercase">Discord</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                {...field}
                                                disabled={disabled}
                                                className="h-12 bg-white/[0.03] border-white/5 focus:border-[#5865F2]/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                placeholder="username"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-[#5865F2]/0 group-focus-within:bg-[#5865F2]/[0.02] pointer-events-none transition-all" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    )}

                    {fields.twitter && (
                        <FormField
                            control={control}
                            name={fields.twitter}
                            render={({ field }) => (
                                <FormItem className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <Twitter className="w-3 h-3 text-[#1DA1F2]" />
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 uppercase">Twitter (X)</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                {...field}
                                                disabled={disabled}
                                                className="h-12 bg-white/[0.03] border-white/5 focus:border-[#1DA1F2]/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                placeholder="@username"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-[#1DA1F2]/0 group-focus-within:bg-[#1DA1F2]/[0.02] pointer-events-none transition-all" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    )}

                    {fields.instagram && (
                        <FormField
                            control={control}
                            name={fields.instagram}
                            render={({ field }) => (
                                <FormItem className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <Instagram className="w-3 h-3 text-[#E1306C]" />
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 uppercase">Instagram</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                {...field}
                                                disabled={disabled}
                                                className="h-12 bg-white/[0.03] border-white/5 focus:border-[#E1306C]/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                placeholder="@username"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-[#E1306C]/0 group-focus-within:bg-[#E1306C]/[0.02] pointer-events-none transition-all" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    )}

                    {fields.youtube && (
                        <FormField
                            control={control}
                            name={fields.youtube}
                            render={({ field }) => (
                                <FormItem className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <Youtube className="w-3 h-3 text-[#FF0000]" />
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 uppercase">YouTube</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                {...field}
                                                disabled={disabled}
                                                className="h-12 bg-white/[0.03] border-white/5 focus:border-[#FF0000]/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                placeholder="Channel URL"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-[#FF0000]/0 group-focus-within:bg-[#FF0000]/[0.02] pointer-events-none transition-all" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    )}

                    {fields.website && (
                        <FormField
                            control={control}
                            name={fields.website}
                            render={({ field }) => (
                                <FormItem className="space-y-2.5 md:col-span-2">
                                    <div className="flex items-center gap-2 px-1">
                                        <Globe className="w-3 h-3 text-emerald-500" />
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 uppercase">Website</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                {...field}
                                                disabled={disabled}
                                                className="h-12 bg-white/[0.03] border-white/5 focus:border-emerald-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                placeholder="https://your-website.com"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-focus-within:bg-emerald-500/[0.02] pointer-events-none transition-all" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
