import { motion } from "framer-motion";
import { Trophy, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ORGANIZER_ROUTES } from "../../lib/routes";
import { Organizer } from "../../lib/types";

interface OrganizerCardProps {
    org: Organizer;
    index: number;
}

const OrganizerCard = ({ org, index }: OrganizerCardProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[28px] opacity-0 group-hover:opacity-30 blur transition duration-500" />
            <div className="relative h-full bg-[#0a0514]/80 border border-white/10 rounded-[28px] overflow-hidden backdrop-blur-sm flex flex-col p-6 transition-all duration-300 group-hover:border-purple-500/30 group-hover:-translate-y-1">

                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                    <Avatar className="w-20 h-20 border-2 border-purple-500/20 group-hover:border-purple-500/50 transition-colors duration-500">
                        <AvatarImage src={org.imageUrl} alt={org.name} className="object-cover" />
                        <AvatarFallback className="bg-purple-900/50 text-2xl font-black text-purple-200">
                            {org.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 rounded-full py-1">
                        Active
                    </Badge>
                </div>

                {/* Info */}
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                        {org.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
                        {org.description || "Crafting elite esports experiences and fostering professional competitive gaming."}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Trophy className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-mono">12+ Events</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-mono">2.4k Follow</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <Link
                    to={ORGANIZER_ROUTES.PROFILE.replace(":id", org._id || "")}
                    className="mt-6 flex items-center justify-between w-full h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-sm font-bold group-hover:bg-purple-500 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                >
                    View Organization
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </motion.div>
    );
};

export default OrganizerCard;
