import { LoaderCircle as Loader2, Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface MemberListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;

    // Search
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    showSearch?: boolean;
    searchPlaceholder?: string;

    // State
    isLoading?: boolean;

    // Empty State Customization
    emptyIcon?: React.ElementType;
    emptyTitle?: string;
    emptyDescription?: string;

    // Pagination
    pagination?: PaginationInfo | null;
    onPageChange?: (page: number) => void;
}

export function MemberList<T>({
    items,
    renderItem,
    keyExtractor,

    searchQuery = "",
    onSearchChange,
    showSearch = false,
    searchPlaceholder = "Search...",

    isLoading = false,

    emptyIcon: EmptyIcon = Users,
    emptyTitle = "No Members Found",
    emptyDescription = "No members match your criteria.",

    pagination,
    onPageChange,
}: MemberListProps<T>) {
    return (
        <div className="space-y-6">
            {/* Search Bar */}
            {showSearch && onSearchChange && (
                <div className="relative group max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-gray-400 h-10 transition-all duration-300 rounded-xl"
                    />
                </div>
            )}

            {isLoading && (!items || items.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-3" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            ) : (!items || items.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <EmptyIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">{emptyTitle}</h3>
                    <p className="text-gray-400 text-sm">{emptyDescription}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <div key={keyExtractor(item)}>
                                {renderItem(item)}
                            </div>
                        ))}
                    </div>

                    {/* Simple Pagination Footer */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <span className="text-xs text-gray-500">
                                Showing <span className="text-gray-300">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="text-gray-300">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-gray-300">{pagination.total}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange?.(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="h-8 w-8 p-0 bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center gap-1 mx-2">
                                    <span className="text-xs font-medium text-white">{pagination.page}</span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-xs text-gray-500">{pagination.pages}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange?.(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className="h-8 w-8 p-0 bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
