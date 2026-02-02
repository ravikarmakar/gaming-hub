import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Gamepad2, Hash, Trophy } from "lucide-react";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { playerSettingsSchema, PlayerSettingsValues } from "@/features/player/lib/playerSchema";

export const GameInfoSettingsForm: React.FC = () => {
    const { updateProfile, isLoading, error, user } = useAuthStore();

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
        },
    });

    const { isDirty } = form.formState;

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
        });
    };

    const onSubmit = async (values: PlayerSettingsValues) => {
        const formData = new FormData();

        // We only care about gameIgn and gameUid here, but we send all for consistency with the API 
        // Or we could just send what changed. The current updateProfile expects these fields.
        formData.append("username", values.username);
        formData.append("bio", values.bio || "");
        formData.append("esportsRole", values.esportsRole);
        formData.append("region", values.region);
        formData.append("country", values.country || "");
        formData.append("isLookingForTeam", String(values.isLookingForTeam));
        formData.append("gameIgn", values.gameIgn || "");
        formData.append("gameUid", values.gameUid || "");

        const success = await updateProfile(formData);
        if (success) {
            toast.success("Game information updated successfully");
            form.reset(values);
        } else {
            toast.error(error || "Failed to update game information");
        }
    };

    return (
        <div className="space-y-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Game Identity Card */}
                    <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <Gamepad2 className="w-4 h-4 text-purple-500" />
                                <CardTitle className="text-sm font-black text-white tracking-[2px]">Game Identity</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-zinc-500 font-medium">
                                Link your in-game identity to your platform profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="gameIgn"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Trophy className="w-3 h-3 text-yellow-500/50" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">In-Game Name (IGN)</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                        placeholder="Your public gaming alias"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-[9px] font-bold text-zinc-600 tracking-widest px-1">
                                                This name will be displayed in tournaments and leaderboards.
                                            </FormDescription>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gameUid"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <div className="flex items-center gap-2 px-1">
                                                <Hash className="w-3 h-3 text-blue-500/50" />
                                                <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-500">Unique ID (UID)</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        className="h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700"
                                                        placeholder="e.g. 5123489210"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-[9px] font-bold text-zinc-600 tracking-widest px-1">
                                                Your official game ID for automated verification.
                                            </FormDescription>
                                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conditional Action Buttons */}
                    {isDirty && (
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
