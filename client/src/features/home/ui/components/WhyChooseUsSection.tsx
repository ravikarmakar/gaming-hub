import { motion } from "framer-motion";
import { ShieldCheck, Users, BarChart3, CircleX as XCircle, CircleCheckBig } from "lucide-react";

import { cn } from "@/lib/utils";

const PAIN_POINTS = [
    {
        problem: "Tired of Scam Tournaments?",
        problemDesc: "Fake tournaments, stolen prize pools, and rigged brackets are everywhere.",
        solution: "Verified & Anti-Cheat Protected",
        solutionDesc: "Every tournament is verified with escrow-held prizes. Our AI anti-cheat catches fraudsters before they ruin your game.",
        icon: ShieldCheck,
        stat: "99.8%",
        statLabel: "Fair Play Rate",
        accentFrom: "from-emerald-500",
        accentTo: "to-green-600",
        iconColor: "text-emerald-400",
        bgGlow: "bg-emerald-500/5",
    },
    {
        problem: "Can't Find Teammates?",
        problemDesc: "Solo queuing into team events. Random Discord LFGs that never work out.",
        solution: "Smart Squad Matching",
        solutionDesc: "Our algorithm matches you with players based on skill, playstyle, timezone, and communication — not just rank.",
        icon: Users,
        stat: "85%",
        statLabel: "Squad Retention",
        accentFrom: "from-purple-500",
        accentTo: "to-violet-600",
        iconColor: "text-purple-400",
        bgGlow: "bg-purple-500/5",
    },
    {
        problem: "No Way to Prove Your Skill?",
        problemDesc: "Screenshots of wins nobody believes. No centralized record of your performance.",
        solution: "Detailed Stats & Rankings",
        solutionDesc: "Every match tracked. K/D, win rate, clutch factor, tournament placements — all in one verified, shareable profile.",
        icon: BarChart3,
        stat: "2M+",
        statLabel: "Matches Tracked",
        accentFrom: "from-cyan-500",
        accentTo: "to-blue-600",
        iconColor: "text-cyan-400",
        bgGlow: "bg-cyan-500/5",
    },
];

export const WhyChooseUsSection = () => {
    return (
        <section className="relative py-24 lg:py-32 bg-[#02000a] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[50%] bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.04)_0%,transparent_70%)]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">
                            THE NEXUS DIFFERENCE
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6">
                        Why Gamers{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            Choose Us
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
                        We built the platform we wished existed. Here's how we solve the problems every competitive gamer faces.
                    </p>
                </motion.div>

                {/* Pain Point Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {PAIN_POINTS.map((item, index) => (
                        <motion.div
                            key={item.problem}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="group relative rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:border-purple-500/20 transition-all duration-500"
                        >
                            {/* Top: Problem */}
                            <div className="p-6 lg:p-8 border-b border-white/[0.04]">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <XCircle className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white mb-1">{item.problem}</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">{item.problemDesc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom: Solution */}
                            <div className={cn("relative p-6 lg:p-8", item.bgGlow)}>
                                <div className="flex items-start gap-3 mb-6">
                                    <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 mt-0.5", item.accentFrom, item.accentTo)}>
                                        <CircleCheckBig className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white mb-1">{item.solution}</h4>
                                        <p className="text-sm text-zinc-400 leading-relaxed">{item.solutionDesc}</p>
                                    </div>
                                </div>

                                {/* Stat Highlight */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                    <div className={cn("w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center", item.iconColor)}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className={cn("text-2xl font-black", item.iconColor)}>{item.stat}</span>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{item.statLabel}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hover glow */}
                            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-purple-500/[0.02] to-transparent" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
