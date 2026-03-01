import { motion } from "framer-motion";
import { Shield, Star, Trophy } from "lucide-react";

const ORGS = [
    { name: "Apex Legends", logo: "/assets/teams/placeholder-1.png", tag: "PRO" },
    { name: "Nexus Gaming", logo: "/assets/teams/placeholder-2.png", tag: "ELITE" },
    { name: "Void Esports", logo: "/assets/teams/placeholder-3.png", tag: "PRO" },
    { name: "Solaris Hub", logo: "/assets/teams/placeholder-4.png", tag: "CHAMP" },
    { name: "Lunar Esports", logo: "/assets/teams/placeholder-5.png", tag: "PRO" },
    { name: "Cyber Squad", logo: "/assets/teams/placeholder-6.png", tag: "ELITE" },
];

const OrgCard = ({ org }: { org: typeof ORGS[0] }) => (
    <div className="flex items-center gap-6 px-10 py-6 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm group hover:border-purple-500/40 hover:bg-zinc-900/50 transition-all duration-500 cursor-default">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
            <Shield className="w-8 h-8 text-purple-400 opacity-50" />
        </div>
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black text-white whitespace-nowrap">{org.name}</span>
                <div className="flex gap-0.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-widest">
                    {org.tag}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    EST. 2024
                </span>
            </div>
        </div>
    </div>
);

export const TopTeamsSection = () => {
    return (
        <section className="relative py-24 bg-[#02000a] overflow-hidden">
            <div className="container mx-auto px-4 mb-16 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                    <Trophy className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-bold uppercase tracking-[0.2em] text-[10px]">Elite Organizations</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter max-w-2xl mb-6">
                    Partnered with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Best in the Game</span>
                </h2>
                <p className="text-zinc-500 max-w-xl font-medium">
                    Behind every great tournament are the teams that define excellence. We host the industry's most respected organizations.
                </p>
            </div>

            {/* Infinite Scrolling Marquee */}
            <div className="relative flex">
                <motion.div
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex gap-8 whitespace-nowrap px-4"
                >
                    {[...ORGS, ...ORGS].map((org, index) => (
                        <OrgCard key={`${org.name}-${index}`} org={org} />
                    ))}
                </motion.div>

                {/* Gradient Overlays */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#02000a] to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#02000a] to-transparent z-10" />
            </div>
        </section>
    );
};
