import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";

export const DeleteTeamSection = () => {
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { isLoading, deleteTeam } = useTeamManagementStore();

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
            <ConfirmActionDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Disband Team?"
                description={
                    <>
                        Are you sure you want to disband this team? This action is <span className="text-red-500 font-black uppercase">permanent</span> and cannot be undone.
                        All members will be removed and the team profile will be deleted forever.
                    </>
                }
                actionLabel="Yes, Disband Team"
                onConfirm={handleDeleteTeam}
                isLoading={isLoading}
                variant="danger"
            />

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
