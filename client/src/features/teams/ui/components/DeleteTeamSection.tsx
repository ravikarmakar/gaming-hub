import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamStore } from "@/features/teams/store/useTeamStore";

export const DeleteTeamSection = () => {
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { isLoading, deleteTeam } = useTeamStore();

    const handleDeleteTeam = async () => {
        const result = await deleteTeam();
        if (result && result.success) {
            toast.success("Team disbanded successfully!");
            setTimeout(() => navigate("/"), 0);
        } else {
            toast.error(
                result?.message || "Failed to disband team. Please try again."
            );
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            <AlertTriangle className="text-red-500" />
                            Disband Team?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 font-medium leading-relaxed">
                            Are you sure you want to disband this team? This action is <span className="text-red-500 font-black uppercase">permanent</span> and cannot be undone.
                            All members will be removed and the team profile will be deleted forever.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 sm:gap-0 mt-4">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTeam}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-500 text-white border-0 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all font-bold"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Yes, Disband Team"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="bg-red-500/5 border-red-500/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Trash2 size={120} />
                </div>
                <CardHeader>
                    <CardTitle className="text-red-500 flex items-center gap-2 text-xl">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Disbanding the team will delete all data associated with it. This action cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="space-y-1">
                            <h4 className="text-white font-semibold">Disband this team</h4>
                            <p className="text-sm text-gray-400">Once you disband a team, there is no going back. Please be certain.</p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            variant="destructive"
                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 transition-all font-bold min-w-[140px]"
                        >
                            Disband Team
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
