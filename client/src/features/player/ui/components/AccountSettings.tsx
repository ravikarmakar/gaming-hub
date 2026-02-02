import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, ShieldCheck, Sword, MessageSquare, Target, Bell, Mail, Smartphone, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
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

import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const AccountSettings: React.FC = () => {
    const { deleteAccount, isLoading: isAuthLoading, user, updateSettings } = useAuthStore();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [localSettings, setLocalSettings] = useState({
        allowChallenges: user?.settings?.allowChallenges ?? true,
        allowMessages: user?.settings?.allowMessages ?? true,
        notifications: {
            platform: user?.settings?.notifications?.platform ?? true,
            email: user?.settings?.notifications?.email ?? true,
            sms: user?.settings?.notifications?.sms ?? false,
        }
    });

    useEffect(() => {
        if (user?.settings) {
            setLocalSettings({
                allowChallenges: user.settings.allowChallenges ?? true,
                allowMessages: user.settings.allowMessages ?? true,
                notifications: {
                    platform: user.settings.notifications?.platform ?? true,
                    email: user.settings.notifications?.email ?? true,
                    sms: user.settings.notifications?.sms ?? false,
                }
            });
        }
    }, [user?.settings]);

    const isPrivacyDirty = localSettings.allowChallenges !== (user?.settings?.allowChallenges ?? true) ||
        localSettings.allowMessages !== (user?.settings?.allowMessages ?? true);

    const isNotificationsDirty = localSettings.notifications.platform !== (user?.settings?.notifications?.platform ?? true) ||
        localSettings.notifications.email !== (user?.settings?.notifications?.email ?? true) ||
        localSettings.notifications.sms !== (user?.settings?.notifications?.sms ?? false);

    const onDiscard = () => {
        setLocalSettings({
            allowChallenges: user?.settings?.allowChallenges ?? true,
            allowMessages: user?.settings?.allowMessages ?? true,
            notifications: {
                platform: user?.settings?.notifications?.platform ?? true,
                email: user?.settings?.notifications?.email ?? true,
                sms: user?.settings?.notifications?.sms ?? false,
            }
        });
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        const success = await updateSettings(localSettings);
        setIsSaving(false);
        if (success) {
            toast.success("Tactical preferences updated");
        } else {
            toast.error("Failed to sync preferences");
        }
    };

    const handleDeleteAccount = async () => {
        const success = await deleteAccount();
        if (success) {
            toast.success("Account deleted successfully");
            navigate("/");
        } else {
            toast.error("Failed to delete account");
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <Card className="bg-white/[0.02] border-white/5 rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col">
                    <CardHeader className="p-5 md:p-6 lg:p-8 pb-2 md:pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <CardTitle className="text-sm font-black text-white tracking-[2px] ">Account & Security</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-zinc-500 font-medium">
                            Manage your account verification and security status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 lg:p-8 pt-0 space-y-4 md:space-y-6 flex-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 gap-4 sm:gap-0">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-zinc-300 tracking-widest">Account Verification</p>
                                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[200px]">
                                    {user?.isAccountVerified
                                        ? "Your email address has been verified."
                                        : "Please verify your email address to secure your account."}
                                </p>
                            </div>
                            {user?.isAccountVerified ? (
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-black text-emerald-500 tracking-[2px]">Verified</span>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-full sm:w-auto px-5 border-yellow-500/20 text-yellow-500 text-[10px] font-black tracking-[2px] hover:bg-yellow-500/5 transition-all rounded-full"
                                >
                                    Verify Now
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 gap-4 sm:gap-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sword className="w-3.5 h-3.5 text-purple-400 opacity-50" />
                                    <p className="text-[11px] font-black text-zinc-300 tracking-widest">Player Verification</p>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[200px]">
                                    {user?.isPlayerVerified
                                        ? "You are a verified player on the platform."
                                        : "Apply for player verification to participate in official events."}
                                </p>
                            </div>
                            {user?.isPlayerVerified ? (
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/5 border border-purple-500/20">
                                    <div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                    <span className="text-[9px] font-black text-purple-500 tracking-[2px]">Verified</span>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-full sm:w-auto px-5 border-purple-500/20 text-purple-400 text-[10px] font-black tracking-[2px] hover:bg-purple-500/5 transition-all rounded-full"
                                >
                                    Apply Now
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden flex flex-col">
                    <CardHeader className="p-5 md:p-6 lg:p-8 pb-2 md:pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Target className="w-4 h-4 text-violet-500" />
                            <CardTitle className="text-sm font-black text-white tracking-[2px] ">Privacy Settings</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-zinc-500 font-medium">
                            Control how other players can interact with you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 lg:p-8 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 gap-4 sm:gap-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                        <Sword className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-zinc-300 tracking-widest">Allow 1v1 Challenges</p>
                                        <p className="text-[10px] text-zinc-500 font-medium">Allow other players to send you direct challenge requests.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={localSettings.allowChallenges}
                                    onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, allowChallenges: checked }))}
                                    className="data-[state=checked]:bg-violet-600"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 gap-4 sm:gap-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <MessageSquare className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-zinc-300 tracking-widest">Allow Messages</p>
                                        <p className="text-[10px] text-zinc-500 font-medium">Allow other players to send you direct messages.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={localSettings.allowMessages}
                                    onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, allowMessages: checked }))}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>

                        {isPrivacyDirty && (
                            <div className="pt-6 md:pt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Button
                                    onClick={onDiscard}
                                    variant="outline"
                                    disabled={isSaving}
                                    className="h-10 md:h-12 w-full sm:w-auto px-6 md:px-8 border-white/5 hover:bg-white/5 text-zinc-400 text-[10px] font-black tracking-[2px] rounded-xl transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="h-10 md:h-12 w-full sm:w-auto px-8 md:px-10 bg-white text-black hover:bg-zinc-200 text-[10px] font-black tracking-[2px] transition-all rounded-xl shadow-xl shadow-white/5 active:scale-[0.98]"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col lg:col-span-2">
                    <CardHeader className="p-5 md:p-6 lg:p-8 pb-2 md:pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Bell className="w-4 h-4 text-purple-500" />
                            <CardTitle className="text-sm font-black text-white tracking-[2px]">Notification Engine</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-zinc-500 font-medium">
                            Choose how you want to receive tactical updates and alerts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 lg:p-8 pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                                        <Bell className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-zinc-300 tracking-widest uppercase">Platform</p>
                                        <p className="text-[9px] text-zinc-500 font-bold tracking-wider">In-app notifications</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={localSettings.notifications.platform}
                                    onCheckedChange={(checked) => setLocalSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, platform: checked }
                                    }))}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                            </div>

                            <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-zinc-300 tracking-widest uppercase">Email</p>
                                        <p className="text-[9px] text-zinc-500 font-bold tracking-wider">Tactical emails</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={localSettings.notifications.email}
                                    onCheckedChange={(checked) => setLocalSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, email: checked }
                                    }))}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>

                            <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                                        <Smartphone className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-zinc-300 tracking-widest uppercase">SMS/Phone</p>
                                        <p className="text-[9px] text-zinc-500 font-bold tracking-wider">Urgent alerts</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={localSettings.notifications.sms}
                                    onCheckedChange={(checked) => setLocalSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, sms: checked }
                                    }))}
                                    className="data-[state=checked]:bg-emerald-600"
                                />
                            </div>
                        </div>

                        {isNotificationsDirty && (
                            <div className="pt-6 md:pt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Button
                                    onClick={onDiscard}
                                    variant="outline"
                                    disabled={isSaving}
                                    className="h-10 md:h-12 w-full sm:w-auto px-6 md:px-8 border-white/5 hover:bg-white/5 text-zinc-400 text-[10px] font-black tracking-[2px] rounded-xl transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="h-10 md:h-12 w-full sm:w-auto px-8 md:px-10 bg-white text-black hover:bg-zinc-200 text-[10px] font-black tracking-[2px] transition-all rounded-xl shadow-xl shadow-white/5 active:scale-[0.98]"
                                >
                                    {isSaving ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/[0.01] border-red-500/10 rounded-[24px] md:rounded-[32px] overflow-hidden">
                <CardHeader className="p-5 md:p-6 lg:p-8 pb-2 md:pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500/70" />
                        <CardTitle className="text-sm font-black text-white tracking-[2px] ">Termination Zone</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-500 font-medium">
                        Permanent actions that cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 md:p-6 lg:p-8 pt-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-red-500/[0.02] border border-red-500/10 gap-4 sm:gap-0">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-zinc-300 tracking-widest">Total Deletion</p>
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[200px]">
                                Delete your account and all associated data permanently.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="h-9 w-full sm:w-auto px-5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-400 text-[10px] font-black tracking-[2px] transition-all rounded-full">
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0d0b14] border-white/5 text-zinc-200 rounded-[32px] p-10 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                                <AlertDialogHeader className="space-y-4">
                                    <AlertDialogTitle className="text-2xl font-black text-white  tracking-tighter">Delete Account Permanentally?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm text-zinc-500 font-medium leading-relaxed font-mono">
                                        This action is irreversible. All your data, including profile, stats, and history, will be permanently removed.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-10 sm:space-x-4">
                                    <AlertDialogCancel className="bg-white/5 border-white/5 text-[10px] font-black tracking-[2px] text-zinc-400 hover:bg-white/10 hover:text-white rounded-xl h-12 flex-1">Abort</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={isAuthLoading}
                                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black tracking-[2px] rounded-xl h-12 flex-1 transition-all"
                                    >
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
