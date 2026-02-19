import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Loader2, Inbox } from "lucide-react";

import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import NotificationItem from "@/features/notifications/ui/components/NotificationItem";
import { TeamPageHeader } from "../components/TeamPageHeader";


const TeamNotificationsPage: React.FC = () => {
    const { notifications, isLoading, fetchTeamNotifications } = useNotificationStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.teamId) {
            fetchTeamNotifications(user.teamId.toString());
        }
    }, [fetchTeamNotifications, user?.teamId]);

    // Strict filter for current team notifications
    const teamNotifications = useMemo(() => {
        if (!user?.teamId) return [];
        const currentTeamId = user.teamId.toString();

        return notifications.filter(n => {
            // Get teamId from relatedData (handle object or string)
            const notificationTeamId = n.relatedData?.teamId?._id
                ? n.relatedData.teamId._id.toString()
                : n.relatedData?.teamId?.toString();

            return notificationTeamId === currentTeamId;
        });
    }, [notifications, user?.teamId]);

    return (
        <div className="h-full">
            <div className="w-full relative z-10">
                <TeamPageHeader
                    icon={Bell}
                    title="Team Notifications"
                    subtitle="Stay updated with your team's tactical alerts and updates"
                />

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
