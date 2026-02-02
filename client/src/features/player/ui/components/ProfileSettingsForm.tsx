
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User as UserIcon, Phone, Mail, Calendar, Image as ImageIcon, FileText, Globe, Share2, Youtube, Instagram, Twitter, Disc } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { playerSettingsSchema, PlayerSettingsValues } from "@/features/player/lib/playerSchema";
import FileUpload from "@/components/FileUpload";

export const ProfileSettingsForm: React.FC = () => {
    const { updateProfile, isLoading, error, user } = useAuthStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCover, setSelectedCover] = useState<File | null>(null);

    const form = useForm<PlayerSettingsValues>({
        resolver: zodResolver(playerSettingsSchema),
        defaultValues: {
            username: user?.username || "",
            bio: user?.bio || "",
            esportsRole: user?.esportsRole || "player",
            region: user?.region || "global",
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
            }
        },
    });

    const { isDirty } = form.formState;
    const hasImageChanges = selectedFile !== null || selectedCover !== null;
    const showButtons = isDirty || hasImageChanges;

    const onReset = () => {
        form.reset({
            username: user?.username || "",
            bio: user?.bio || "",
            esportsRole: user?.esportsRole || "player",
            region: user?.region || "global",
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
            }
        });
        setSelectedFile(null);
        setSelectedCover(null);
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

        if (selectedFile) {
            formData.append("avatar", selectedFile);
        }
        if (selectedCover) {
            formData.append("coverImage", selectedCover);
        }

        const success = await updateProfile(formData);
        if (success) {
            toast.success("Profile updated successfully");
            setSelectedFile(null);
            setSelectedCover(null);
        } else {
            toast.error(error || "Failed to update profile");
        }
    };

    return (
        <div className="space-y-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Media Card */}
                    <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <ImageIcon className="w-4 h-4 text-purple-500" />
                                <CardTitle className="text-sm font-black text-white tracking-[2px]">Appearance</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-500 font-medium">
                                Customize your visual presence on the platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-6">
                                <FileUpload
                                    variant="banner"
                                    value={selectedCover || user?.coverImage}
                                    onChange={(file) => setSelectedCover(file)}
                                    maxSize={5 * 1024 * 1024}
                                    label="Change Cover"
                                />

                                <div className="px-10 pb-10 -mt-20 relative flex flex-col sm:flex-row items-end gap-8">
                                    <FileUpload
                                        variant="avatar"
                                        value={selectedFile || user?.avatar}
                                        onChange={(file) => setSelectedFile(file)}
                                        maxSize={2 * 1024 * 1024}
                                        fallbackText={user?.username?.[0]}
                                    />
                                    <div className="flex-1 space-y-2 pb-2">
                                        <h3 className="text-sm font-black text-white tracking-[2px]">Profile Picture</h3>
                                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium max-w-xs">
                                            Your primary profile image. Recommended size 512x512px.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <UserIcon className="w-4 h-4 text-blue-500" />
                                <CardTitle className="text-sm font-black text-white tracking-[2px]">Personal Details</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-500 font-medium">
                                Your personal information is used for identity verification and support.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <UserIcon className="w-3 h-3 text-blue-500/50" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Gender</FormLabel>
                                            </div>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 focus:ring-0 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 capitalize">
                                                        <SelectValue placeholder="Identify yourself" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-[#0d0b14] border-white/10 text-zinc-200 rounded-xl overflow-hidden backdrop-blur-xl">
                                                    {[
                                                        { label: "Male", value: "male" },
                                                        { label: "Female", value: "female" },
                                                        { label: "Other", value: "other" },
                                                        { label: "Prefer not to say", value: "prefer_not_to_say" }
                                                    ].map((option) => (
                                                        <SelectItem key={option.value} value={option.value} className="capitalize py-3 focus:bg-blue-500/10 focus:text-white transition-colors cursor-pointer font-bold text-xs tracking-widest">
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />



                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Calendar className="w-3 h-3 text-purple-500/50" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Date of Birth</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        type="date"
                                                        className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700 [color-scheme:dark]"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="space-y-2.5">
                                        <div className="flex items-center gap-2 px-1">
                                            <Phone className="w-3 h-3 text-emerald-500/50" />
                                            <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Phone Number</FormLabel>
                                        </div>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    {...field}
                                                    type="tel"
                                                    className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                                <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2.5 opacity-60 grayscale pointer-events-none">
                                <div className="flex items-center gap-2 px-1">
                                    <Mail className="w-3 h-3 text-zinc-500" />
                                    <label className="text-[10px] font-black tracking-[3px] text-zinc-500">Primary Email</label>
                                </div>
                                <div className="h-12 bg-white/[0.03] border-white/5 rounded-xl text-zinc-500 font-bold tracking-tight text-sm px-4 flex items-center border-dashed border">
                                    {user?.email}
                                </div>
                                <p className="text-[9px] font-bold text-zinc-600 tracking-widest px-1">
                                    Email can only be changed from account security settings.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <UserIcon className="w-4 h-4 text-blue-500" />
                                <CardTitle className="text-sm font-black text-white tracking-[2px]">Primary Details</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-500 font-medium">
                                Your basic information and community presence.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500 px-1">Username</FormLabel>
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
                                            <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500 px-1">Esports Role</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 focus:ring-0 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 capitalize">
                                                        <SelectValue placeholder="Select a spec" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-[#0d0b14] border-white/10 text-zinc-200 rounded-xl overflow-hidden backdrop-blur-xl">
                                                    {["player", "rusher", "sniper", "igl", "support", "coach"].map((role) => (
                                                        <SelectItem key={role} value={role} className="capitalize py-3 focus:bg-purple-500/10 focus:text-white transition-colors cursor-pointer font-bold text-xs tracking-widest">
                                                            {role}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500 px-1">Region</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 focus:ring-0 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4">
                                                        <SelectValue placeholder="Select Sector" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-[#0d0b14] border-white/10 text-zinc-200 rounded-xl overflow-hidden backdrop-blur-xl">
                                                    {[
                                                        { label: "NA - North America", value: "na" },
                                                        { label: "EU - Europe", value: "eu" },
                                                        { label: "SEA - SE Asia", value: "sea" },
                                                        { label: "SA - South America", value: "sa" },
                                                        { label: "MEA - Mid East", value: "mea" },
                                                        { label: "Global Node", value: "global" }
                                                    ].map((reg) => (
                                                        <SelectItem key={reg.value} value={reg.value} className="py-3 focus:bg-purple-500/10 focus:text-white transition-colors cursor-pointer font-bold text-xs tracking-widest">
                                                            {reg.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500 px-1">Country</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                        placeholder="e.g. India, USA, etc."
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isLookingForTeam"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-6 group hover:border-purple-500/20 transition-all">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w - 1.5 h - 1.5 rounded - full ${field.value ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'} `} />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Looking for Team</FormLabel>
                                            </div>
                                            <CardDescription className="text-[10px] font-bold text-zinc-600 tracking-widest leading-relaxed">
                                                {field.value
                                                    ? "You are currently looking for a team to join."
                                                    : "You are not currently looking for a team."}
                                            </CardDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="scale-125 data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-zinc-800"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Bio Card */}
                    <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <CardTitle className="text-sm font-black text-white tracking-[2px]">About You</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-500 font-medium">
                                Describe yourself and your gaming experience.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem className="space-y-2.5">
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500 px-1">Bio</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Textarea
                                                    {...field}
                                                    placeholder="Tell us about yourself..."
                                                    className="min-h-[160px] bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-2xl text-white font-medium text-sm leading-relaxed px-5 py-4 resize-none placeholder:text-zinc-700"
                                                />
                                                <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                            </div>
                                        </FormControl>
                                        <div className="flex justify-between items-center px-1">
                                            <FormDescription className="text-[9px] font-bold text-zinc-600 tracking-widest">
                                                500 characters max
                                            </FormDescription>
                                            <span className="text-[9px] font-bold text-zinc-600 tracking-widest">
                                                {field.value?.length || 0} / 500
                                            </span>
                                        </div>
                                        <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Social Connections */}
                    <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Share2 className="w-4 h-4 text-pink-500" />
                                <CardTitle className="text-sm font-black text-white tracking-[2px]">Social Connections</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-500 font-medium">
                                Link your social media profiles to build your community.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="socialLinks.discord"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Disc className="w-3 h-3 text-[#5865F2]" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Discord</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        className="h-12 bg-white/[0.03] border-white/5 focus:border-[#5865F2]/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                        placeholder="username#0000"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-[#5865F2]/0 group-focus-within:bg-[#5865F2]/[0.02] pointer-events-none transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="socialLinks.twitter"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Twitter className="w-3 h-3 text-[#1DA1F2]" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Twitter (X)</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
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

                                <FormField
                                    control={form.control}
                                    name="socialLinks.instagram"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Instagram className="w-3 h-3 text-[#E1306C]" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Instagram</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
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

                                <FormField
                                    control={form.control}
                                    name="socialLinks.youtube"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Youtube className="w-3 h-3 text-[#FF0000]" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">YouTube</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
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

                                <FormField
                                    control={form.control}
                                    name="socialLinks.website"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5 md:col-span-2">
                                            <div className="flex items-center gap-2 px-1">
                                                <Globe className="w-3 h-3 text-emerald-500" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Website</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conditional Action Buttons */}
                    {showButtons && (
                        <div className="flex items-center justify-end gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onReset}
                                disabled={isLoading}
                                className="h-12 px-8 border-white/5 hover:bg-white/5 text-zinc-400 text-[10px] font-black tracking-[2px] rounded-xl transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group relative overflow-hidden px-10 h-12 bg-white text-black hover:bg-zinc-200 transition-all font-black tracking-[2px] text-[10px] rounded-xl active:scale-[0.98] shadow-xl shadow-white/5"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3 h-3 transition-transform group-hover:scale-110" />
                                            Save Changes
                                        </>
                                    )}
                                </span>
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
};
