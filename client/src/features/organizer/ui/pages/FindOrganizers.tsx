import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Building, Search } from "lucide-react";

import { useOrganizerStore } from "../../store/useOrganizerStore";
import { Input } from "@/components/ui/input";
import OrganizerCard from "../components/OrganizerCard";
import { useDebounce } from "@/hooks/useDebounce";
import { ResourceGridWrapper } from "@/components/shared/ResourceGridWrapper";

const FindOrganizers = () => {
    const { organizers, isLoading, fetchOrganizers, organizersPagination } = useOrganizerStore();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        fetchOrganizers(1, 20, debouncedSearchQuery);
    }, [fetchOrganizers, debouncedSearchQuery]);

    const handleLoadMore = () => {
        // Robust hasMore check
        const safeHasMore = organizersPagination
            ? (organizersPagination.page < organizersPagination.pages) || (organizersPagination.total > organizersPagination.page * organizersPagination.limit)
            : false;

        if (safeHasMore && !isLoading) {
            fetchOrganizers(organizersPagination!.page + 1, 20, debouncedSearchQuery, true);
        }
    };

    const hasMore = organizersPagination
        ? organizersPagination.page < organizersPagination.pages
        : false;

    return (
        <ResourceGridWrapper
            title={
                <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 w-max rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-2">
                        <Building className="w-4 h-4" />
                        The Ecosystem
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                        Find <span className="text-purple-500">Organizers</span>
                    </h1>
                </div>
            }
            description="Discover and follow the most influential organizations driving the future of competitive gaming. Join their community and compete in elite tournaments."
            stats={{ label: "Active Orgs", value: organizersPagination?.total || 0 }}
            isLoading={isLoading}
            isEmpty={!isLoading && (!organizers || organizers.length === 0)}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            emptyMessage="No Organizers Found"
            filters={
                <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md w-full">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search organizers..."
                            className="pl-10 h-10 bg-white/5 border-white/10 text-[10px] font-bold rounded-xl focus-visible:ring-purple-500/50 placeholder:text-white/20"
                        />
                    </div>
                    {/* Placeholder for future filters to maintain layout consistency if needed */}
                </div>
            }
        >
            <AnimatePresence mode="popLayout">
                {organizers && organizers.map((org, index) => (
                    <OrganizerCard key={org._id} org={org} index={index} />
                ))}
            </AnimatePresence>
        </ResourceGridWrapper >
    );
};

export default FindOrganizers;
