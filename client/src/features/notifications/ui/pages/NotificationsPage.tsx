import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useInfiniteNotificationsQuery, useUnreadCountQuery } from "../../hooks/useNotificationQueries";
import { useMarkAllAsReadMutation } from "../../hooks/useNotificationMutations";
import NotificationItem from "../components/NotificationItem";
import { Button } from "@/components/ui/button";
import { ResourceGrid } from "@/components/shared/ResourceGrid";
import { EmptyState } from "@/components/shared/EmptyState";

const NotificationsPage: React.FC = () => {
    const {
        data: infiniteData,
        isLoading: isQueryLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteNotificationsQuery();

    const { data: unreadCount = 0 } = useUnreadCountQuery();
    const markAllAsReadMutation = useMarkAllAsReadMutation();

    // Flatten notifications from all pages
    const notifications = useMemo(() => {
        return infiniteData?.pages.flatMap(page => page.notifications) || [];
    }, [infiniteData]);

    const isLoading = isQueryLoading && !notifications.length;
    const isActionPending = markAllAsReadMutation.isPending;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-brand-dark relative overflow-hidden">
            {/* Background Ambient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2.5"
                        >
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Bell className="w-4 h-4 text-purple-400" />
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-black text-white tracking-tight"
                        >
                            Inbox <span className="text-purple-500/20 font-light ml-1 text-2xl">{unreadCount > 0 ? unreadCount : ""}</span>
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAllAsReadMutation.mutate()}
                            disabled={isActionPending || unreadCount === 0}
                            className="bg-white/[0.03] border-white/10 text-gray-400 hover:text-purple-400 rounded-xl h-10 w-10 sm:w-auto px-0 sm:px-4 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:border-purple-500/20 text-xs font-bold flex items-center justify-center"
                        >
                            <CheckCheck className="w-3.5 h-3.5 sm:mr-2" />
                            <span className="hidden sm:inline">Read</span>
                        </Button>
                    </motion.div>
                </div>

                {/* Notifications List via ResourceGrid */}
                <ResourceGrid
                    items={notifications}
                    isLoading={isLoading}
                    isEmpty={!isLoading && notifications.length === 0}
                    hasMore={!!hasNextPage}
                    onLoadMore={fetchNextPage}
                    isFetchingMore={isFetchingNextPage}
                    virtualize={true}
                    columns={1}
                    itemHeight={120} // Increased height for better content fit
                    rowGap={10} // Increased gap for visual clarity
                    emptyStateComponent={<EmptyState message="Clean Slate" subMessage="Your nexus is quiet for now. New invitations and alerts will appear here." />}
                    renderItem={(notification) => (
                        <NotificationItem key={notification._id} notification={notification} />
                    )}
                />
            </div>
        </div>
    );
};

export default NotificationsPage;
