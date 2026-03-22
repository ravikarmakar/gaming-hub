import { motion, AnimatePresence } from "framer-motion";
import { ResourceGrid, ResourceGridProps } from "./ResourceGrid";

export interface ResourceGridWrapperProps<T = any> extends ResourceGridProps<T> {
    title: React.ReactNode;
    description?: string;
    stats?: { label: string; value: number | string };
    filters: React.ReactNode;
    showFilters?: boolean;
    headerAction?: React.ReactNode;
}

export const ResourceGridWrapper = <T,>(props: ResourceGridWrapperProps<T>) => {
    const {
        title,
        description,
        stats,
        filters,
        showFilters = true,
        headerAction,
        ...gridProps 
    } = props;

    return (
        <div className="w-full bg-transparent text-white relative pb-24 overflow-hidden" style={{ overflowAnchor: "none" }}>
            {/* Ambient Background Elements */}
            <div className="absolute top-0 -left-4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none -ml-40 -mt-40" />
            <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none -mr-40" />
            <div className="absolute bottom-40 -left-4 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[200px] pointer-events-none -ml-60" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[180px] pointer-events-none -mr-40 -mb-40" />

            <div className="w-full relative z-10">
                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="relative overflow-hidden">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-2">
                        {/* Title Row */}
                        <div className="mb-6 space-y-4">
                            {title}
                        </div>

                        {/* Description + Actions Row */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-white/40 font-medium max-w-2xl text-[10px] md:text-xs tracking-[0.2em] font-mono leading-relaxed italic border-l-2 border-violet-500/20 pl-4 lg:mb-1"
                                >
                                    {description}
                                </motion.p>
                            )}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                                {headerAction && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="w-full lg:w-auto"
                                    >
                                        {headerAction}
                                    </motion.div>
                                )}

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
                        </div>
                    </div>
                </div>

                {/* ── Filters ───────────────────────────────────────────────── */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden relative z-10"
                        >
                            <div id="player-filters" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                                {filters}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Grid Rendering ────────────────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <ResourceGrid {...gridProps} />
                </div>
            </div>
        </div>
    );
};
