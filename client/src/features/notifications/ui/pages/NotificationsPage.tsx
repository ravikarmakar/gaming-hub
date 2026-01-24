import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Filter, Trash2, Loader2, Inbox } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import NotificationItem from "../components/NotificationItem";
import { Button } from "@/components/ui/button";

const NotificationsPage: React.FC = () => {
    const { notifications, isLoading, unreadCount, fetchNotifications, markAllAsRead, pagination } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#0a0514] relative overflow-hidden">
            {/* Background Ambient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-purple-400 font-bold tracking-wider text-sm">NOTIFICATIONS</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-white tracking-tight"
                        >
                            Inbox <span className="text-purple-500/50">{unreadCount > 0 ? `(${unreadCount})` : ""}</span>
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
                            className="bg-white/5 border-white/10 text-gray-400 hover:text-white rounded-xl h-10"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAllAsRead()}
                            disabled={isLoading || unreadCount === 0}
                            className="bg-white/5 border-white/10 text-gray-400 hover:text-red-400 rounded-xl h-10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    </motion.div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                            <p className="text-purple-200/60 font-medium">Synchronizing signals...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <>
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notification) => (
                                    <NotificationItem key={notification._id} notification={notification} />
                                ))}
                            </AnimatePresence>

                            {pagination.totalPages > pagination.currentPage && (
                                <div className="flex justify-center mt-12">
                                    <Button
                                        variant="ghost"
                                        onClick={() => fetchNotifications(pagination.currentPage + 1)}
                                        disabled={isLoading}
                                        className="text-purple-400 hover:text-white hover:bg-purple-500/10 px-8 h-12 rounded-xl border border-purple-500/20"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Load More"}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                                <Inbox className="w-12 h-12 text-gray-700" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Clean Slate</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                Your nexus is quiet for now. New invitations and alerts will appear here.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
