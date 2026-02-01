import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Loader2, Inbox } from "lucide-react";

import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import NotificationItem from "@/features/notifications/ui/components/NotificationItem";


const TeamNotificationsPage: React.FC = () => {
    const { notifications, isLoading, fetchNotifications } = useNotificationStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Filter notifications relevant to the current team
    const teamNotifications = useMemo(() => {
        if (!user?.teamId) return [];
        return notifications.filter(n =>
            n.relatedData?.teamId?.toString() === user.teamId.toString() ||
            (n.type === "TEAM_INVITE" || n.type === "TEAM_JOIN_REQUEST" || n.type === "TEAM_LEAVE" || n.type === "TEAM_KICK")
        );
    }, [notifications, user?.teamId]);

    return (
        <div className="h-full">
            <div className="w-full relative z-10">
                {/* Header */}
                <div className="flex flex-col mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-purple-400 font-bold tracking-wider text-sm">TEAM NEXUS</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black text-white tracking-tighter"
                    >
                        Team <span className="text-purple-500/50">Notifications</span>
                    </motion.h1>
                    <p className="mt-2 text-gray-500 text-sm">Stay updated with your team's tactical alerts and updates</p>
                </div>

                {/* Notifications List */}
                <div className="space-y-4 w-full">
                    {isLoading && teamNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                            <p className="text-purple-200/60 font-medium">Scanning team frequencies...</p>
                        </div>
                    ) : teamNotifications.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {teamNotifications.map((notification) => (
                                <NotificationItem key={notification._id} notification={notification} />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                                <Inbox className="w-12 h-12 text-gray-700" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Alerts</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                All quiet on the team front. New tactical updates will appear here.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamNotificationsPage;
