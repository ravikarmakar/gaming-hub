import { motion } from "framer-motion";
import { UserPlus, Users, Swords, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";

const STEPS = [
    {
        step: "01",
        title: "Create Your Profile",
        description: "Sign up in 30 seconds. Set your game, rank, and playstyle. Your journey to the top starts with a single click.",
        icon: UserPlus,
        color: "from-purple-500 to-violet-600",
        textColor: "text-purple-400",
        glowColor: "bg-purple-500/10",
    },
    {
        step: "02",
        title: "Find Your Squad",
        description: "Browse elite teams or let our smart matching find the perfect squad. Filter by game, rank, region, and availability.",
        icon: Users,
        color: "from-indigo-500 to-blue-600",
        textColor: "text-indigo-400",
        glowColor: "bg-indigo-500/10",
    },
    {
        step: "03",
        title: "Enter Tournaments",
        description: "Join daily, weekly, and seasonal competitions across 8+ game titles. From casual scrims to high-stakes prize pools.",
        icon: Swords,
        color: "from-cyan-500 to-teal-600",
        textColor: "text-cyan-400",
        glowColor: "bg-cyan-500/10",
    },
    {
        step: "04",
        title: "Win & Rise",
        description: "Climb the leaderboards, earn prizes, and build your legacy. Top performers get scouted by pro organizations.",
        icon: Trophy,
        color: "from-amber-500 to-orange-600",
        textColor: "text-amber-400",
        glowColor: "bg-amber-500/10",
    },
];

export const HowItWorksSection = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const userId = user?._id || "";

    return (
        <section className="relative py-24 lg:py-32 bg-[#02000a] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[150px] -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[120px] -translate-y-1/2" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                            YOUR JOURNEY
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6">
                        From Zero to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Hero
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
                        Getting started is dead simple. Four steps between you and esports glory.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-px" >
                            <div className="h-full bg-gradient-to-r from-purple-500/20 via-indigo-500/20 via-cyan-500/20 to-amber-500/20" />
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-amber-500/40 origin-left"
                            />
                        </div>

                        {STEPS.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="group relative flex flex-col items-center text-center"
                            >
                                {/* Step number + Icon */}
                                <div className="relative mb-6">
                                    <div className={cn(
                                        "w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl",
                                        step.color
                                    )}>
                                        <step.icon className="w-9 h-9 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#02000a] border-2 border-zinc-800 flex items-center justify-center">
                                        <span className="text-[11px] font-black text-white">{step.step}</span>
                                    </div>
                                </div>

                                {/* Mobile connector */}
                                {index < STEPS.length - 1 && (
                                    <div className="lg:hidden w-px h-8 bg-gradient-to-b from-white/10 to-transparent mb-2" />
                                )}

                                {/* Text */}
                                <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center mt-14"
                >
                    <Button
                        onClick={() => navigate(user ? PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", userId) : AUTH_ROUTES.REGISTER)}
                        className="group flex items-center gap-4 px-8 py-7 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-wider text-sm hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] border-none"
                    >
                        START YOUR JOURNEY
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};
