import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Search, SlidersHorizontal } from "lucide-react";

import { useOrganizerStore } from "../../store/useOrganizerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrganizerCard from "../components/OrganizerCard";
import { useDebounce } from "@/hooks/useDebounce";

const FindOrganizers = () => {
    const { organizers, isLoading, fetchOrganizers } = useOrganizerStore();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        fetchOrganizers(1, 12, debouncedSearchQuery);
    }, [fetchOrganizers, debouncedSearchQuery]);

    return (
        <div className="min-h-screen bg-[#05010d] text-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6"
                >
                    <Building className="w-4 h-4" />
                    The Ecosystem
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400"
                >
                    E-Sports <span className="text-purple-500">Organizers</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto"
                >
                    Discover and follow the most influential organizations driving the future of competitive gaming. Join their community and compete in elite tournaments.
                </motion.p>
            </div>

            {/* Search & Filter Bar */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Search organizers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 bg-white/5 border-white/10 focus:border-purple-500/50 rounded-xl h-12"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2 w-full md:w-auto">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </Button>
                        <Button className="h-12 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold px-8 w-full md:w-auto">
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Organizers Grid */}
            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[320px] rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                        ))}
                    </div>
                ) : organizers && organizers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {organizers.map((org, index) => (
                                <OrganizerCard key={org._id} org={org} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Building className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No Organizers Found</h3>
                        <p className="text-gray-500 max-w-sm">Try adjusting your search query or check back later for new organizations.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindOrganizers;
