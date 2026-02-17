import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { TeamMembers } from "../components/TeamMembers";
import { MemberHeader } from "../components/MemberHeader";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { JoinRequestsList } from "../components/JoinRequestsList";
import { TEAM_ACTIONS, TEAM_ACTIONS_ACCESS } from "@/features/teams/lib/access";
import { useTeamManagementStore } from "@/features/teams/store/useTeamManagementStore";

const TeamMembersPage = () => {
  const navigate = useNavigate();
  const [showPolicy, setShowPolicy] = useState(true);
  const {
    currentTeam,
    getTeamById,
    isLoading,
    removeMember,
    updateMemberRole,
  } = useTeamManagementStore();
  const { user } = useAuthStore();
  const { can } = useAccess()

  const handleRemove = useCallback(
    async (memberId: string) => {
      const result = await removeMember(memberId);
      if (result && result.success) {
        toast.success(result.message || "Member removed successfully");
      } else {
        toast.error(result?.message || "Failed to remove member");
      }
    },
    [removeMember, user?.teamId, getTeamById]
  );

  const handleEditRole = useCallback(
    async (role: string, memberId: string) => {
      const result = await updateMemberRole(role, memberId);
      if (result) {
        toast.success("Member role updated successfully");
      } else {
        toast.error("Failed to update member role");
      }
    },
    [updateMemberRole]
  );

  const handleViewProfile = useCallback((id: string) => {
    navigate(PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", id));
  }, [navigate]);

  if (!currentTeam) {
    return null;
  }

  // RBAC
  const accessJoinRequestList = can({
    ...TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.accessJoinRequestList],
    scopeId: currentTeam._id
  });
  const canManageRoster = can({
    ...TEAM_ACTIONS_ACCESS[TEAM_ACTIONS.manageRoster],
    scopeId: currentTeam._id
  });

  return (
    <div className="min-h-screen">
      <MemberHeader
        currentUserId={user?._id ?? ""}
        teamId={currentTeam._id}
        members={currentTeam.teamMembers ?? []}
        showInfo={showPolicy}
        onInfoToggle={() => setShowPolicy(!showPolicy)}
      />

      <main className="w-full space-y-8">
        {/* Registration Info Alert - Retractable */}
        <AnimatePresence>
          {showPolicy && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="relative group overflow-hidden rounded-xl border border-blue-500/30 bg-[#0F111A]/40 px-4 py-3.5 backdrop-blur-xl flex items-start justify-between gap-3 shadow-xl shadow-blue-500/5">
                <div className="flex items-start gap-3 text-sm text-blue-200/90 w-full">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="leading-relaxed">
                      <span className="font-bold text-blue-100 block mb-1 sm:inline sm:mr-1.5 underline decoration-blue-500/30 underline-offset-4">Tournament Policy:</span>
                      Only <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded">IGL, Rusher, Sniper, Support</span> roles are auto-registered.
                      <span className="block sm:inline sm:ml-1 text-blue-300/80 italic">Others are listed as substitutes.</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPolicy(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 hover:text-white transition-all shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <TeamMembers
          members={currentTeam.teamMembers ?? []}
          owner={canManageRoster}
          isCaptain={currentTeam.captain === user?._id}
          currentUserId={user?._id ?? ""}
          onRemove={handleRemove}
          onEditRole={handleEditRole}
          onViewProfile={handleViewProfile}
          isLoading={isLoading}
        />

        {accessJoinRequestList && (
          <section className="pt-4">
            <JoinRequestsList />
          </section>
        )}
      </main>
    </div >
  );
};

export default TeamMembersPage;
