import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickAction {
    label: string;
    icon: LucideIcon;
    link: string;
    color: string;
}

interface QuickAccessProps {
    actions: QuickAction[];
}

export const QuickAccess = ({ actions }: QuickAccessProps) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {actions.map((action, index) => (
                <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                >
                    <Link to={action.link} className="group">
                        <GlassCard className="p-6 h-full flex flex-col items-center text-center hover:border-purple-500/30 transition-all">
                            <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:bg-purple-500/10 mb-4 transition-all duration-300 group-hover:scale-110", action.color)}>
                                <action.icon size={28} />
                            </div>
                            <span className="hidden sm:block text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors">{action.label}</span>
                        </GlassCard>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};
