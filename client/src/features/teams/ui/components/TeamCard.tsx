import React from "react";
import { Team } from "../../store/useTeamStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Trophy, ShieldCheck, Gamepad2, Globe } from "lucide-react";
import { ROUTES } from "@/lib/routes";

interface TeamCardProps {
    team: Team;
    index: number;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link
                to={ROUTES.TEAM_PROFILE.replace(":id", team._id)}
                className="block relative h-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] hover:border-purple-500/40 transition-all duration-500 overflow-hidden"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                {/* Status Badges */}
                <div className="absolute top-5 right-5 flex gap-2 z-10">
                    {team.isRecruiting && (
                        <div className="relative">
                            <div className="absolute -inset-1 bg-emerald-500/20 blur-sm rounded-full animate-pulse" />
                            <span className="relative flex items-center px-2.5 py-1 rounded-full bg-white/5 text-emerald-400 text-[10px] font-black border border-emerald-500/30 uppercase tracking-tighter">
                                Recruiting
                            </span>
                        </div>
                    )}
                    {team.isVerified && (
                        <div className="p-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                            <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                        </div>
                    )}
                </div>

                {/* Header */}
                <div className="flex flex-col items-center mb-8 pt-4 relative">
                    <div className="relative mb-5">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full blur-md opacity-20 group-hover:opacity-60 transition duration-500" />
                        <div className="relative w-24 h-24 rounded-3xl bg-[#0d091a] border border-white/10 flex items-center justify-center overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            {team.imageUrl ? (
                                <img src={team.imageUrl} alt={team.teamName} className="w-full h-full object-cover" />
                            ) : (
                                <Gamepad2 className="w-10 h-10 text-purple-400/40" />
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors uppercase tracking-tight leading-none mb-1">
                            {team.teamName}
                        </h3>
                        <span className="text-[10px] font-bold text-purple-400/50 tracking-[0.2em]">#{team.tag}</span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-purple-500/20 transition-all duration-500">
                        <Users className="w-4 h-4 text-purple-400/70" />
                        <span className="text-[10px] text-white/40 uppercase font-black">Members</span>
                        <span className="text-sm text-white font-bold">{team.teamMembers?.length || 0}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-purple-500/20 transition-all duration-500">
                        <Trophy className="w-4 h-4 text-indigo-400/70" />
                        <span className="text-[10px] text-white/40 uppercase font-black">Tourneys</span>
                        <span className="text-sm text-white font-bold">{team.playedTournaments?.length || 0}</span>
                    </div>
                </div>

                {/* Bio */}
                <div className="relative mb-8">
                    <p className="text-sm text-purple-200/40 line-clamp-2 text-center h-10 leading-relaxed italic px-2">
                        "{team.bio || "Crafting a legacy in the digital arena..."}"
                    </p>
                </div>

                {/* Region Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-white/5 relative">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                        <Globe className="w-3.5 h-3.5 text-purple-500/70" />
                        <span className="text-[10px] font-black text-purple-200/60 uppercase tracking-widest">
                            {team.region || "Global"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-white/40 group-hover:text-purple-400 transition-all duration-500 uppercase tracking-tighter">
                        Nexus Profile <span className="text-purple-500">→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default TeamCard;
