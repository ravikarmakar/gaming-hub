import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Sword, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { cn } from "@/lib/utils";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";
import { useAuthStore } from "@/features/auth/store/useAuthStore";


export const UniqueFeatures = () => {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthStore()

    const setIsCreateTeamOpen = (open: boolean) => {
        if (open) {
            searchParams.set("modal", "create-team");
        } else {
            searchParams.delete("modal");
        }
        setSearchParams(searchParams);
    };

    const features = [
        {
            id: "teams",
            title: "Find Best Teams",
            highlight: "SQUAD SCOUTING",
            description: "Discover and recruit the most dominant teams. Our data-driven scouting engine connects you with elite organizations.",
            icon: Search,
            image: "/assets/features/scout-teams.png",
            color: "from-purple-600 to-indigo-600",
            orbColor: "bg-purple-600/30",
            glowColor: "text-purple-400",
            onClick: () => navigate(TEAM_ROUTES.ALL_TEAMS),
        },
        {
            id: "players",
            title: "Find Top Tier Players",
            highlight: "VALUED PROSPECTS",
            description: "Find the hidden gems in the tier-1 player market. Analyze performance metrics, playstyles, and chemistry.",
            icon: Users,
            image: "/assets/features/scout-players.png",
            color: "from-violet-600 to-purple-600",
            orbColor: "bg-violet-600/30",
            glowColor: "text-violet-400",
            onClick: () => navigate(PLAYER_ROUTES.ALL_PLAYERS),
        },
        {
            id: "create",
            title: "Create Your Team",
            highlight: "SQUAD SYNTHESIS",
            description: "Build your legacy from the ground up. Our intuitive team builder allows you to manage rosters and track growth.",
            icon: Sword,
            image: "/assets/features/create-squad.png",
            color: "from-fuchsia-600 to-purple-600",
            orbColor: "bg-fuchsia-600/30",
            glowColor: "text-fuchsia-400",
            onClick: () => user?.teamId ? navigate(TEAM_ROUTES.DASHBOARD) : setIsCreateTeamOpen(true),
        },
    ];

    const ActiveIcon = features[activeTab].icon;

    return (
        <section className="relative py-28 lg:py-48 bg-[#02000a] overflow-hidden selection:bg-purple-500/30">
            {/* Cinematic Background Elements - Simplified for Deep Dark Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-20" />


            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

                    {/* Interactive Feature Selectors (Left side) */}
                    <div className="w-full lg:w-2/5 flex flex-col gap-10">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">
                                    KRM ESPORTS CORE SUITE
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                                Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Next Gen</span>
                            </h2>
                        </motion.div>

                        <div className="flex flex-col gap-2">
                            {features.map((feature, index) => (
                                <button
                                    key={feature.id}
                                    onMouseEnter={() => setActiveTab(index)}
                                    onClick={feature.onClick}
                                    className="group relative text-left"
                                >
                                    <div className={cn(
                                        "flex flex-col py-6 px-6 rounded-3xl transition-all duration-500 border border-transparent",
                                        activeTab === index
                                            ? "bg-white/[0.03] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
                                            : "hover:bg-white/[0.01]"
                                    )}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn(
                                                "text-[10px] font-black tracking-widest transition-colors duration-500",
                                                activeTab === index ? "text-purple-400" : "text-zinc-600"
                                            )}>
                                                FEATURE // 0{index + 1}
                                            </span>
                                            {activeTab === index && (
                                                <motion.div
                                                    layoutId="glow"
                                                    className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,1)]"
                                                />
                                            )}
                                        </div>
                                        <h3 className={cn(
                                            "text-3xl lg:text-4xl font-black tracking-tighter transition-all duration-500",
                                            activeTab === index
                                                ? "text-white"
                                                : "text-zinc-700 group-hover:text-zinc-400"
                                        )}>
                                            {feature.title}
                                        </h3>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6 px-6"
                            >
                                <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                                    {features[activeTab].description}
                                </p>
                                <button
                                    onClick={features[activeTab].onClick}
                                    className="group flex items-center gap-6"
                                >
                                    <div className="w-14 h-14 rounded-full border border-purple-500/30 flex items-center justify-center transition-all duration-500 group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]">
                                        <ArrowRight className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-white font-black uppercase text-sm tracking-widest group-hover:text-purple-400 transition-colors">
                                        Experience Now
                                    </span>
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Cinematic Showcase Hub (Right side) */}
                    <div className="w-full lg:w-3/5 relative group/hub">
                        {/* External Glow - Deeper and more subtle */}
                        <div className={cn(
                            "absolute -inset-8 rounded-[4rem] blur-3xl opacity-10 transition-all duration-1000",
                            features[activeTab].orbColor
                        )} />

                        <div className="relative aspect-[16/10] rounded-[3.5rem] overflow-hidden border border-purple-900/10 shadow-3xl bg-[#010005]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                    className="absolute inset-0"
                                >
                                    {/* Atmospheric Glow Overlay - Deeper layers */}
                                    <div className={cn(
                                        "absolute inset-0 z-10 opacity-30",
                                        "bg-gradient-to-tr from-black via-[#010005]/80 to-purple-900/10"
                                    )} />

                                    <img
                                        src={features[activeTab].image}
                                        alt={features[activeTab].title}
                                        className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-1000 group-hover/hub:scale-110"
                                    />

                                    {/* Overlay Gradient for extreme depth */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                    {/* Floating Label - Sleeker and darker */}
                                    <div className="absolute bottom-12 left-12 z-20">
                                        <motion.div
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex items-center gap-4 bg-black/80 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-purple-900/20 shadow-4xl"
                                        >
                                            <div className={cn("p-2 rounded-xl bg-purple-950/40", features[activeTab].glowColor)}>
                                                <ActiveIcon className="w-5 h-5 opacity-70" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest font-mono leading-none mb-1">
                                                    {features[activeTab].highlight}
                                                </span>
                                                <span className="text-zinc-400 text-xs font-bold tracking-tight">
                                                    SYSTEM ENCRYPTED
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Corner Accents - Minimalist and dark */}
                                    <div className="absolute top-12 right-12 w-20 h-20 pointer-events-none opacity-20">
                                        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-purple-500/30 to-transparent" />
                                        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-purple-500/30 to-transparent" />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Visual Echoes - Deep Neon bits */}
                        <div className="absolute -top-16 -right-16 w-80 h-80 bg-purple-950/10 blur-3xl rounded-full pointer-events-none group-hover/hub:bg-purple-900/15 transition-all duration-1000" />
                    </div>

                </div>
            </div>
        </section>
    );
};
