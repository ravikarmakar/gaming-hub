import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    const { deleteAccount, isLoading, user } = useAuthStore();
    const navigate = useNavigate();

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
        <div className="space-y-8">
            <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <CardTitle className="text-sm font-black text-white uppercase tracking-[2px] italic">Access & Security</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-500 font-medium">
                        Verify your credentials and manage authorization status.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">Verification Status</p>
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[200px]">
                                {user?.isAccountVerified
                                    ? "Biometric sync complete. Account is authentic."
                                    : "Identification pending. Please sync your email terminal."}
                            </p>
                        </div>
                        {user?.isAccountVerified ? (
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[2px]">Verified</span>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-5 border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[2px] hover:bg-yellow-500/5 transition-all rounded-full"
                            >
                                Sync Now
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/[0.01] border-red-500/10 rounded-[32px] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500/70" />
                        <CardTitle className="text-sm font-black text-white uppercase tracking-[2px] italic">Termination Zone</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-500 font-medium">
                        Permanent actions that cannot be reversed by the architects.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-red-500/[0.02] border border-red-500/10">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">Total Deletion</p>
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[200px]">
                                Wipe your matrix presence and all related data packets.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="h-9 px-5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[2px] transition-all rounded-full">
                                    De-materialize
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0d0b14] border-white/5 text-zinc-200 rounded-[32px] p-10 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                                <AlertDialogHeader className="space-y-4">
                                    <AlertDialogTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">Confirm De-materialization?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm text-zinc-500 font-medium leading-relaxed font-mono">
                                        This sequence is irreversible. All data packets related to your grid presence will be permanently purged. Are you certain?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-10 sm:space-x-4">
                                    <AlertDialogCancel className="bg-white/5 border-white/5 text-[10px] font-black uppercase tracking-[2px] text-zinc-400 hover:bg-white/10 hover:text-white rounded-xl h-12 flex-1">Abort</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[2px] rounded-xl h-12 flex-1 transition-all"
                                    >
                                        Execute Purge
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
