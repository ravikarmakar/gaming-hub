import { motion } from "framer-motion";
import { Users, Trophy, DollarSign, Activity } from "lucide-react";

interface StatItemProps {
    label: string;
    value: string;
    subValue: string;
    icon: any;
    delay: number;
}

const StatItem = ({ label, value, subValue, icon: Icon, delay }: StatItemProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="relative group h-full flex flex-col items-center justify-center p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />

        <div className="relative z-10 w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-8 h-8 text-purple-400" />
        </div>

        <h3 className="relative z-10 text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
            {value}
        </h3>
        <p className="relative z-10 text-purple-400 font-bold uppercase tracking-[0.2em] text-xs mb-3">
            {label}
        </p>
        <p className="relative z-10 text-zinc-500 text-sm font-medium">
            {subValue}
        </p>
    </motion.div>
);

export const StatsSection = () => {
    return (
        <section className="relative py-24 bg-[#02000a]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatItem
                        label="Total Players"
                        value="150K+"
                        subValue="Rising daily"
                        icon={Users}
                        delay={0.1}
                    />
                    <StatItem
                        label="Prize Pool"
                        value="$2.5M"
                        subValue="Distributed so far"
                        icon={DollarSign}
                        delay={0.2}
                    />
                    <StatItem
                        label="Tournaments"
                        value="12K+"
                        subValue="Across 8+ games"
                        icon={Trophy}
                        delay={0.3}
                    />
                    <StatItem
                        label="Active Teams"
                        value="850+"
                        subValue="Pro & Amateur"
                        icon={Activity}
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
};
