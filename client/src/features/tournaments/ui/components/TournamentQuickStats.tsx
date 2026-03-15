
import React from 'react';
import { TrendingUp, Users, ChevronRight, Sword, Shield, Calendar, MapPin, Activity, Gamepad2 } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";

interface TournamentQuickStatsProps {
    prizePool: number;
    joinedSlots: number;
    maxSlots: number;
    regStatus: "approved" | "pending" | "none";
    eventProgress: string;
    registrationMode: string;
    format: string;
    startDate: string;
    entryFee: string | number;
    isPaid: boolean;
    category: string;
    onRegister?: () => void;
    showRegisterButton?: boolean;
    showAdditionalStats?: boolean;
    completedRounds?: number;
    totalRounds?: number;
    invitedCount?: number;
    maxInvitedSlots?: number;
    t1SpecialCount?: number;
    eventType?: string;
}

export const TournamentQuickStats: React.FC<TournamentQuickStatsProps> = ({
    prizePool,
    joinedSlots,
    maxSlots,
    regStatus,
    eventProgress,
    registrationMode,
    format,
    startDate,
    entryFee,
    isPaid,
    category,
    onRegister,
    showRegisterButton = true,
    showAdditionalStats = false,
    completedRounds = 0,
    totalRounds = 0,
    invitedCount = 0,
    maxInvitedSlots = 0,
    t1SpecialCount = 0,
    eventType = "tournament",
}) => {
    return (
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-6 py-2">
            {/* Left Side: Essential Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full lg:w-auto">
                {/* Rewards */}
                <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                    <div className="h-8 w-8 flex items-center justify-center text-emerald-400 bg-emerald-400/10 rounded-lg">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Rewards</p>
                        <p className="text-xs font-black text-white tracking-tight">
                            ₹{formatCurrency(prizePool)}
                        </p>
                    </div>
                </div>

                {/* Density */}
                <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                    <div className="h-8 w-8 flex items-center justify-center text-blue-400 bg-blue-400/10 rounded-lg">
                        <Users size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Slots</p>
                        <p className="text-xs font-black text-white tracking-tight">
                            {joinedSlots || 0} <span className="text-white/20">/ {maxSlots}</span>
                        </p>
                    </div>
                </div>

                {/* Format - Always show now per user request */}
                <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                    <div className="h-8 w-8 flex items-center justify-center text-purple-400 bg-purple-400/10 rounded-lg">
                        <Sword size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Format</p>
                        <p className="text-xs font-black text-white tracking-tight uppercase">{format || category || "Squad"}</p>
                    </div>
                </div>

                {/* Progress / Starts On */}
                {showAdditionalStats ? (
                    <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                        <div className="h-8 w-8 flex items-center justify-center text-emerald-400 bg-emerald-400/10 rounded-lg">
                            <Activity size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Progress</p>
                            <p className="text-xs font-black text-white tracking-tight">
                                {completedRounds} <span className="text-white/20">/ {totalRounds}</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                        <div className="h-8 w-8 flex items-center justify-center text-amber-400 bg-amber-400/10 rounded-lg">
                            <Calendar size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Starts On</p>
                            <p className="text-xs font-black text-white tracking-tight">
                                {(() => {
                                    if (!startDate) return "TBD";
                                    const date = new Date(startDate);
                                    return isNaN(date.getTime()) 
                                        ? "TBD" 
                                        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                })()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Invited Teams / Entry */}
                {(showAdditionalStats && (invitedCount > 0 || maxInvitedSlots > 0)) ? (
                    <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                        <div className="h-8 w-8 flex items-center justify-center text-fuchsia-400 bg-fuchsia-400/10 rounded-lg">
                            <Users size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Invited</p>
                            <p className="text-xs font-black text-white tracking-tight">
                                {invitedCount} <span className="text-white/20">Teams</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                        <div className="h-8 w-8 flex items-center justify-center text-rose-400 bg-rose-400/10 rounded-lg">
                            <Activity size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Entry</p>
                            <p className={cn("text-xs font-black tracking-tight", isPaid ? "text-rose-400" : "text-emerald-400")}>
                                {isPaid ? `₹${entryFee || 0}` : "FREE"}
                            </p>
                        </div>
                    </div>
                )}

                {/* T1 Special / Type */}
                {(showAdditionalStats && (t1SpecialCount > 0 || eventType === "t1-special")) ? (
                    <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                        <div className="h-8 w-8 flex items-center justify-center text-sky-400 bg-sky-400/10 rounded-lg">
                            <Activity size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">T1 Teams</p>
                            <p className="text-xs font-black text-white tracking-tight">
                                {t1SpecialCount} <span className="text-white/20">Teams</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 group bg-gray-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/5 transition-all">
                        <div className="h-8 w-8 flex items-center justify-center text-indigo-400 bg-indigo-400/10 rounded-lg">
                            <MapPin size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Type</p>
                            <p className="text-xs font-black text-white tracking-tight uppercase">
                                {registrationMode === 'invite-only' ? 'Invited' : 'Tournament'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {showRegisterButton && (
                <>
                    {/* Partition Line (Visible on Desktop) */}
                    <div className="hidden lg:block h-12 w-px bg-white/10 mx-4" />
                    <div className="block lg:hidden w-full h-px bg-white/10 my-2" />

                    {/* Right Side: Primary CTA */}
                    <div className="w-full lg:w-auto min-w-[180px]">
                        {eventProgress === "completed" ? (
                            <div className="w-full px-6 py-3 bg-purple-900/20 border border-purple-800/50 text-purple-300 font-black rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(88,28,135,0.2)] uppercase tracking-[0.1em] text-[10px]">
                                <Gamepad2 size={16} /> COMPLETED
                            </div>
                        ) : regStatus === "approved" ? (
                            <div className="w-full px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)] uppercase tracking-[0.1em] text-[10px]">
                                <Sword size={16} /> REGISTERED
                            </div>
                        ) : regStatus === "pending" ? (
                            <div className="w-full px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black rounded-xl flex items-center justify-center gap-2 animate-pulse uppercase tracking-[0.1em] text-[10px]">
                                <Shield size={16} /> PENDING REVIEW
                            </div>
                        ) : (
                            <button
                                onClick={onRegister}
                                disabled={!onRegister}
                                className="w-full relative px-8 py-3 bg-purple-900 hover:bg-purple-800 text-white font-black rounded-xl transition-all shadow-[0_10px_30px_-10px_rgba(88,28,135,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(88,28,135,0.6)] group/btn overflow-hidden border border-purple-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 tracking-[0.1em] uppercase text-[10px]">
                                    {registrationMode === "invite-only" ? "Request Entry" : "Register Now"}
                                    <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                                </span>
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform"
                                    style={{ transitionDuration: "1000ms" }}
                                />
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Helper for conditional classes (if cn not available, use simple template literal)
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
