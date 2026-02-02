import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { PremiumSkeleton } from "./PremiumSkeleton";

interface ResourceGridWrapperProps {
    title: React.ReactNode;
    description: string;
    stats?: {
        label: string;
        value: number | string;
    };
    filters: React.ReactNode;
    children: React.ReactNode;
    isLoading: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadingItemCount?: number; // How many skeletons to show
    emptyMessage?: string;
    emptySubMessage?: string;
}

export const ResourceGridWrapper = ({
    title,
    description,
    stats,
    filters,
    children,
    isLoading,
    isEmpty,
    hasMore,
    onLoadMore,
    loadingItemCount = 8,
    emptyMessage = "No Results Found",
    emptySubMessage = "Try adjusting your filters or search terms."
}: ResourceGridWrapperProps) => {

    const { ref, inView } = useInView({
        threshold: 0.1, // Require at least 10% visibility
        rootMargin: "50px", // Reduced further to be safe
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (inView && hasMore && !isLoading) {
            // Debounce the call to prevent double-firing or rapid triggers
            timeoutId = setTimeout(() => {
                onLoadMore();
            }, 300);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [inView, hasMore, isLoading, onLoadMore]);

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 md:px-12 relative overflow-hidden">
            {/* Background Ambient Orbs (Shared) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-800/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "12000ms" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-800/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "15000ms" }} />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-800/15 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: "20000ms" }} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {title}
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/40 font-medium max-w-2xl text-[10px] md:text-xs tracking-[0.2em] leading-relaxed italic border-l-2 border-violet-500/20 pl-4"
                        >
                            {description}
                        </motion.p>
                    </div>

                    {stats && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center self-start lg:self-center"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                                <div className="relative flex items-center gap-6 px-10 py-6 rounded-3xl bg-[#0d091a]/80 border border-white/5 backdrop-blur-xl">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-white/30 tracking-[0.3em] mb-1">{stats.label}</p>
                                        <p className="text-4xl font-black text-white italic tracking-tighter">{stats.value}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Filters Section */}
                <div className="mb-12">
                    {filters}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px]">
                    {children}

                    {/* Loading Skeletons */}
                    {isLoading && (
                        <>
                            {[...Array(loadingItemCount)].map((_, i) => (
                                <PremiumSkeleton key={`skel-${i}`} className="h-[450px]" />
                            ))}
                        </>
                    )}
                </div>

                {/* Empty State */}
                {!isLoading && isEmpty && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center space-y-6 rounded-[2.5rem] bg-white/[0.01] border border-dashed border-white/10 backdrop-blur-sm mt-8"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <Search className="w-10 h-10 text-white/10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight italic text-white/80">{emptyMessage}</h3>
                            <p className="text-white/30 text-sm font-medium tracking-widest">{emptySubMessage}</p>
                        </div>
                    </motion.div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasMore && !isEmpty && (
                    <div
                        ref={ref}
                        className={`mt-20 flex justify-center py-10 ${isLoading ? "invisible" : "visible"}`}
                    >
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};
