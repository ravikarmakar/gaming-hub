import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { TOURNAMENT_ROUTES } from "@/features/tournaments/lib/routes";
import { useGetTournamentsQuery } from "@/features/tournaments/hooks/useTournamentQueries";
import TournamentCard from "./TournamentCard";

const FeaturedTournaments = () => {
    const navigate = useNavigate();
    const { data: eventsData, isLoading } = useGetTournamentsQuery({ limit: 6 });
    const events = eventsData?.data || [];

    return (
        <section id="tournaments" className="py-20 bg-[#02000a] relative overflow-hidden">
            {/* Background Gradients & Grid */}
            <div className="absolute inset-0 bg-[#02000a]">
                <div className="absolute -top-24 left-1/4 w-[30%] h-[300px] bg-purple-600/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
                <div className="absolute -bottom-24 right-1/4 w-[30%] h-[300px] bg-cyan-600/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

                {/* Grid Pattern consistent with Hero */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center md:text-left"
                    >
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                            <Trophy className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-300 font-bold uppercase tracking-[0.2em] text-[10px]">Elite Competitions</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">Events</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Button
                            variant="outline"
                            onClick={() => navigate(TOURNAMENT_ROUTES.TOURNAMENTS)}
                            className="hidden md:flex rounded-full border-white/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400 transition-all"
                        >
                            View All Tournaments
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </motion.div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[400px] rounded-3xl bg-white/5 border border-white/5 overflow-hidden flex flex-col">
                                <Skeleton className="h-48 w-full bg-white/10 rounded-none" />
                                <div className="p-6 space-y-4 flex-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-20 bg-white/10" />
                                        <Skeleton className="h-4 w-20 bg-white/10" />
                                    </div>
                                    <Skeleton className="h-8 w-3/4 bg-white/10" />
                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
                                        <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    events && events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.slice(0, 6).map((event) => (
                                <TournamentCard key={event._id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/5 bg-opacity-50">
                            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
                            <p className="text-zinc-400">Be the first to create a tournament!</p>
                        </div>
                    )
                )}

                {/* Mobile View All Button */}
                <div className="mt-12 flex justify-center md:hidden">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => navigate(TOURNAMENT_ROUTES.TOURNAMENTS)}
                        className="w-full rounded-full border-white/10 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400 transition-all"
                    >
                        View All Tournaments
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedTournaments;
