import { motion } from "framer-motion";
import { Trophy, Zap, Shield, Globe, Headphones, Users, Sword, Target } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
    { name: "Automated Tournaments", icon: Trophy, color: "text-yellow-400" },
    { name: "Instant Payouts", icon: Zap, color: "text-cyan-400" },
    { name: "Anti-Cheat Protection", icon: Shield, color: "text-red-400" },
    { name: "Global Leaderboards", icon: Globe, color: "text-green-400" },
    { name: "24/7 Support", icon: Headphones, color: "text-purple-400" },
    { name: "Active Community", icon: Users, color: "text-pink-400" },
    { name: "Daily Scrims", icon: Sword, color: "text-orange-400" },
    { name: "Skill-Based Matchmaking", icon: Target, color: "text-indigo-400" },
];

export const PlatformFeatures = () => {
    return (
        <div className="w-full bg-[#02000a] py-12 border-y border-white/5 overflow-hidden relative">
            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#02000a] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#02000a] to-transparent z-10" />

            <div className="flex">
                <motion.div
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex gap-16 whitespace-nowrap px-8"
                >
                    {/* Double the list for infinite seamless scroll */}
                    {[...features, ...features].map((feature, index) => (
                        <div key={`${feature.name}-${index}`} className="flex items-center gap-4 group cursor-default">
                            <div className={cn("p-2 rounded-lg bg-white/5 border border-white/5 transition-colors group-hover:border-white/10 group-hover:bg-white/10", feature.color)}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <span className="text-lg font-bold text-zinc-400 group-hover:text-white transition-colors">
                                {feature.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
