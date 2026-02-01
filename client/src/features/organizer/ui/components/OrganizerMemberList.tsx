import { Users, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { OrganizerMemberCard } from "./OrganizerMemberCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
    joinedDate?: string;
}

interface OrganizerMemberListProps {
    members: Member[];
    onRemove: (id: string) => void;
    onUpdateRole: (id: string, role: string) => Promise<void>;
    onViewProfile: (id: string) => void;
    onTransferOwnership?: (id: string) => void;
    canManage: boolean;
    canRemove: boolean;
    canTransfer?: boolean;
    currentUserId: string;
    isLoading: boolean;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    pagination?: { total: number; page: number; limit: number; pages: number } | null;
    onPageChange?: (page: number) => void;
}

export const OrganizerMemberList = ({
    members,
    onRemove,
    onUpdateRole,
    onViewProfile,
    onTransferOwnership,
    canManage,
    canRemove,
    canTransfer,
    currentUserId,
    isLoading,
    searchQuery = "",
    onSearchChange,
    pagination,
    onPageChange,
}: OrganizerMemberListProps) => {

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative group max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 bg-black/40 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-gray-600 h-10 transition-all duration-300 rounded-xl"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-3" />
                    <p className="text-gray-400 text-sm">Loading members...</p>
                </div>
            ) : (!members || members.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <Users className="w-12 h-12 text-gray-600 mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">No Members Found</h3>
                    <p className="text-gray-400 text-sm">Your organization's roster is empty or no matches for "{searchQuery}".</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map((member) => (
                            <OrganizerMemberCard
                                key={member._id}
                                member={member}
                                onRemove={onRemove}
                                onUpdateRole={onUpdateRole}
                                onViewProfile={onViewProfile}
                                onTransferOwnership={onTransferOwnership}
                                canManage={canManage}
                                canRemove={canRemove}
                                canTransfer={canTransfer}
                                isSelf={member._id === currentUserId}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>

                    {/* Simple Pagination Footer */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <span className="text-xs text-gray-500">
                                Showing <span className="text-gray-300">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="text-gray-300">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-gray-300">{pagination.total}</span> members
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
                                    <span className="text-gray-600">/</span>
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
};
