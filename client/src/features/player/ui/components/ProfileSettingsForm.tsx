import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { playerSettingsSchema, PlayerSettingsValues } from "@/features/player/lib/playerSchema";
import FileUpload from "@/components/FileUpload";

export const ProfileSettingsForm: React.FC = () => {
    const { updateProfile, isLoading, error, user } = useAuthStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm<PlayerSettingsValues>({
        resolver: zodResolver(playerSettingsSchema),
        defaultValues: {
            username: user?.username || "",
            bio: user?.bio || "",
            esportsRole: user?.esportsRole || "player",
        },
    });

    const onSubmit = async (values: PlayerSettingsValues) => {
        const formData = new FormData();
        formData.append("username", values.username);
        if (values.bio) formData.append("bio", values.bio);
        formData.append("esportsRole", values.esportsRole);
        if (selectedFile) {
            formData.append("avatar", selectedFile);
        }

        const success = await updateProfile(formData);
        if (success) {
            toast.success("Profile updated successfully");
            setSelectedFile(null);
        } else {
            toast.error(error || "Failed to update profile");
        }
    };

    return (
        <div className="space-y-10">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Minimal Profile Picture Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 p-10 rounded-[32px] bg-white/[0.02] border border-white/5">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                            <FileUpload
                                value={selectedFile || user?.avatar}
                                onChange={(file) => setSelectedFile(file)}
                                accept="image/*"
                                maxSize={2 * 1024 * 1024}
                                compact={true}
                                className="relative w-32 h-32 rounded-full border-2 border-white/10 hover:border-purple-500/50 transition-all overflow-hidden"
                            />
                        </div>
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                            <h3 className="text-sm font-black text-white uppercase tracking-[2px]">Profile Identifier</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium max-w-xs">
                                Upload a high-resolution avatar to represent your status in the Nexus grid. Minimum 400x400px recommended.
                            </p>
                            <div className="flex gap-4 pt-2 justify-center sm:justify-start">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Max 2MB</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">JPG/PNG/WEBP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem className="space-y-2.5">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[3px] text-zinc-500 px-1">Grid Name</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                {...field}
                                                className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                placeholder="Enter your grid tag"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="esportsRole"
                            render={({ field }) => (
                                <FormItem className="space-y-2.5">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[3px] text-zinc-500 px-1">Battle Spec</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 focus:ring-0 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 capitalize">
                                                <SelectValue placeholder="Select a spec" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#0d0b14] border-white/10 text-zinc-200 rounded-xl overflow-hidden backdrop-blur-xl">
                                            {["player", "rusher", "sniper", "igl", "support", "coach"].map((role) => (
                                                <SelectItem key={role} value={role} className="capitalize py-3 focus:bg-purple-500/10 focus:text-white transition-colors cursor-pointer font-bold text-xs uppercase tracking-widest">
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem className="space-y-2.5">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[3px] text-zinc-500 px-1">Grid Log (Bio)</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Textarea
                                            {...field}
                                            placeholder="Declare your purpose in the grid..."
                                            className="min-h-[160px] bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-2xl text-white font-medium text-sm leading-relaxed px-5 py-4 resize-none placeholder:text-zinc-700"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                    </div>
                                </FormControl>
                                <div className="flex justify-between items-center px-1">
                                    <FormDescription className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                        500 Units Max
                                    </FormDescription>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                        {field.value?.length || 0} / 500
                                    </span>
                                </div>
                                <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-8">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="group relative overflow-hidden px-10 h-14 bg-white text-black hover:bg-zinc-200 transition-all font-black uppercase tracking-[3px] text-[11px] rounded-2xl active:scale-[0.98]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                        Save Changes
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
