import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, DollarSign, Activity } from "lucide-react";

// --- Animated Counter ---
const useCountUp = (end: number, suffix = "", duration = 2200) => {
    const [display, setDisplay] = useState(`0${suffix}`);
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let start = 0;
                    const increment = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            clearInterval(timer);
                            // Format the final value
                            if (end >= 1000) {
                                setDisplay(`${(end / 1000).toFixed(end % 1000 === 0 ? 0 : 1)}K${suffix}`);
                            } else {
                                setDisplay(`${end}${suffix}`);
                            }
                        } else {
                            if (end >= 1000) {
                                setDisplay(`${(start / 1000).toFixed(1)}K${suffix}`);
                            } else {
                                setDisplay(`${Math.floor(start)}${suffix}`);
                            }
                        }
                    }, 16);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, suffix, duration]);

    return { display, ref };
};

interface StatItemProps {
    label: string;
    endValue: number;
    suffix: string;
    displayOverride?: string;
    subValue: string;
    icon: any;
    delay: number;
}

const StatItem = ({ label, endValue, suffix, displayOverride, subValue, icon: Icon, delay }: StatItemProps) => {
    const { display, ref } = useCountUp(endValue, suffix);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="relative group h-full flex flex-col items-center justify-center p-8 lg:p-10 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:border-purple-500/20 transition-all duration-500 hover:-translate-y-1"
        >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />

            {/* Icon */}
            <div className="relative z-10 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-purple-500/15 transition-all duration-500">
                <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-purple-400" />
            </div>

            {/* Counter */}
            <h3 className="relative z-10 text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter tabular-nums">
                {displayOverride || display}
            </h3>
            <p className="relative z-10 text-purple-400 font-black uppercase tracking-[0.2em] text-[10px] lg:text-xs mb-2">
                {label}
            </p>
            <p className="relative z-10 text-zinc-500 text-sm font-medium">
                {subValue}
            </p>
        </motion.div>
    );
};

export const StatsSection = () => {
    return (
        <section className="relative py-20 lg:py-24 bg-[#02000a]">
            {/* Background subtle glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.04)_0%,transparent_70%)]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                        THE NUMBERS DON'T LIE
                    </span>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <StatItem
                        label="Total Players"
                        endValue={150000}
                        suffix="+"
                        displayOverride={undefined}
                        subValue="Rising daily"
                        icon={Users}
                        delay={0.1}
                    />
                    <StatItem
                        label="Prize Pool"
                        endValue={2500000}
                        suffix=""
                        displayOverride="$2.5M+"
                        subValue="Distributed so far"
                        icon={DollarSign}
                        delay={0.2}
                    />
                    <StatItem
                        label="Tournaments"
                        endValue={12000}
                        suffix="+"
                        displayOverride={undefined}
                        subValue="Across 8+ games"
                        icon={Trophy}
                        delay={0.3}
                    />
                    <StatItem
                        label="Active Teams"
                        endValue={850}
                        suffix="+"
                        displayOverride={undefined}
                        subValue="Pro & Amateur"
                        icon={Activity}
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
};
