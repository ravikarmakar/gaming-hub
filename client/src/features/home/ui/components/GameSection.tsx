import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Flame, Crosshair, Zap, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

// Game Data
const GAMES = [
    {
        id: "free-fire",
        title: "Free Fire",
        genre: "Battle Royale",
        description: "Survive the battlegrounds in style.",
        longDescription: "Fast-paced action with unique characters and tactical gameplay. Join millions in the ultimate survival test.",
        color: "from-purple-600/80 to-purple-800/80",
        accent: "text-amber-400",
        image: "/assets/games/free-fire.jpg",
        icon: Flame
    },
    {
        id: "bgmi",
        title: "BGMI",
        genre: "Tactical Shooter",
        description: "India Ka Battlegrounds.",
        longDescription: "The ultimate survival shooter. Drop in, gear up, and compete for the Chicken Dinner with your squad.",
        color: "from-emerald-500/80 to-teal-600/80",
        accent: "text-emerald-400",
        image: "/assets/games/bgmi.jpg",
        icon: Crosshair
    },
    {
        id: "pixel-royale",
        title: "Pixel Royale",
        genre: "Voxel Arcade",
        description: "Blocky Chaos.",
        longDescription: "A voxel-based shooter where destruction is the key to victory. Build, destroy, and conquer the arena.",
        color: "from-violet-500/80 to-purple-600/80",
        accent: "text-violet-400",
        image: "/assets/games/pixel.jpg",
        icon: Zap
    },
    {
        id: "cyber-clash",
        title: "Cyber Clash",
        genre: "Neon Warfare",
        description: "Future Combat.",
        longDescription: "High-speed competitive combat in a futuristic cyberpunk metropolis. Speed is everything.",
        color: "from-cyan-500/80 to-blue-600/80",
        accent: "text-cyan-400",
        image: "/assets/games/clash-royale.jpg",
        icon: Target
    },
];

const GameSection = () => {
    const [activeId, setActiveId] = useState<string | null>(GAMES[0].id);

    // Mouse position for 3D tilt effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for tilt
    const rotateX = useSpring(mouseY, { stiffness: 100, damping: 30 });
    const rotateY = useSpring(mouseX, { stiffness: 100, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
        if (activeId !== id) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        // Calculate normalized position (-1 to 1) and scale for rotation
        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;
        mouseX.set(x);
        mouseY.set(-y); // Invert Y for natural tilt
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="relative w-full max-w-[1400px] mx-auto my-24 flex flex-col gap-12 px-4">
            {/* Section Heading */}
            <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Badge variant="outline" className="gap-2 px-3 py-1 rounded-full bg-purple-500/10 border-purple-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-black text-purple-400 tracking-[0.3em]">
                            TOURNAMENT HUBS
                        </span>
                    </Badge>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter"
                >
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Battlefield</span>
                </motion.h2>
            </div>

            <div className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden bg-[#0a0514] border border-purple-500/20 shadow-2xl shadow-purple-900/20 flex flex-col md:flex-row group/container perspective-[1000px]">
                {/* Background Gradient/Mesh */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#0d0616] to-[#05020a] opacity-80 pointer-events-none" />

                {GAMES.map((game) => (
                    <motion.div
                        key={game.id}
                        onMouseEnter={() => {
                            setActiveId(game.id);
                            mouseX.set(0);
                            mouseY.set(0);
                        }}
                        onMouseMove={(e) => handleMouseMove(e, game.id)}
                        onMouseLeave={() => {
                            mouseX.set(0);
                            mouseY.set(0);
                        }}
                        style={{
                            rotateX: activeId === game.id ? rotateX : 0,
                            rotateY: activeId === game.id ? rotateY : 0,
                            transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)"
                        }}
                        className={cn(
                            "relative h-full transition-all duration-700 overflow-hidden border-r border-white/5 last:border-r-0 cursor-pointer will-change-transform z-10",
                            activeId === game.id ? "flex-[3.5] z-20" : "flex-1 hover:flex-[1.2] opacity-80 hover:opacity-100"
                        )}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 w-full h-full">
                            <div className={cn(
                                "absolute inset-0 bg-[#0a0514] transition-opacity duration-500 z-10",
                                activeId === game.id ? "opacity-20" : "opacity-60 group-hover/container:opacity-40"
                            )} />
                            <img
                                src={game.image}
                                alt={game.title}
                                style={{ transitionDuration: "1.5s" }}
                                className={cn(
                                    "w-full h-full object-cover transition-transform ease-out",
                                    activeId === game.id ? "scale-105" : "scale-100 grayscale-[0.8] hover:grayscale-0"
                                )}
                            />
                            {/* Gradient Overlay */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-t from-[#0a0514] via-purple-900/10 to-transparent",
                                activeId === game.id ? "opacity-80" : "opacity-90"
                            )} />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-10 pointer-events-none">
                            <div className="relative flex flex-col items-start pointer-events-auto">
                                {/* Icon & Genre Badge */}
                                <motion.div
                                    layout
                                    className="flex items-center gap-3 mb-3 bg-black/40 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/5"
                                >
                                    <div className={cn("p-2 rounded-full", activeId === game.id ? game.accent.replace('text-', 'bg-') + "/20 " + game.accent : "bg-white/5 text-gray-400")}>
                                        <game.icon size={18} />
                                    </div>
                                    {activeId === game.id && (
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs font-bold uppercase tracking-widest bg-transparent hover:bg-transparent p-0",
                                                activeId === game.id ? game.accent : "text-gray-400"
                                            )}
                                        >
                                            {game.genre}
                                        </Badge>
                                    )}
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    layout="position"
                                    className={cn(
                                        "font-black text-white uppercase leading-none mb-3 transition-all duration-500",
                                        activeId === game.id ? "text-4xl md:text-5xl lg:text-6xl drop-shadow-xl" : "text-2xl md:text-3xl text-gray-300"
                                    )}
                                >
                                    {game.title}
                                </motion.h2>

                                {/* Collapsed Description */}
                                {activeId !== game.id && (
                                    <p className="text-gray-400 text-xs font-medium line-clamp-2 md:hidden">
                                        {game.description}
                                    </p>
                                )}

                                {/* Expanded Content */}
                                <AnimatePresence mode="wait">
                                    {activeId === game.id && (
                                        <motion.div
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            variants={{
                                                hidden: { opacity: 0, height: 0 },
                                                visible: {
                                                    opacity: 1,
                                                    height: "auto",
                                                    transition: {
                                                        height: { duration: 0.4 },
                                                        staggerChildren: 0.1
                                                    }
                                                }
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <motion.p
                                                variants={contentVariants}
                                                className="text-gray-300 text-base md:text-lg font-medium max-w-md mb-6 leading-relaxed line-clamp-3 md:line-clamp-none"
                                            >
                                                {game.longDescription}
                                            </motion.p>

                                            <motion.div variants={contentVariants}>
                                                <Button
                                                    aria-label={`Play ${game.title}`}
                                                    className={cn(
                                                        "group flex items-center gap-2 px-6 py-6 bg-gradient-to-r text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:brightness-110 transition-all shadow-lg shadow-purple-900/20 active:scale-95 border-none",
                                                        game.color
                                                    )}
                                                >
                                                    <span>Play Now</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Vertical Text for collapsed state (Desktop) */}
                        {activeId !== game.id && (
                            <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
                                <h3 className="text-4xl font-black text-white/80 uppercase -rotate-90 whitespace-nowrap tracking-[0.2em] transform translate-y-12">
                                    {game.title}
                                </h3>
                            </div>
                        )}

                        {/* Active Indicator Glow */}
                        {activeId === game.id && (
                            <div className={cn("absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-100", game.color.replace('from-', 'bg-gradient-to-t from-').replace('to-', 'to-transparent opacity-10'))} />
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default GameSection;