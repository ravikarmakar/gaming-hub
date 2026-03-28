import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LoaderCircle as Loader2, Inbox, AlertTriangle } from "lucide-react";

import { useTeamNotificationsQuery } from "@/features/notifications/hooks/useNotificationQueries";
import NotificationItem from "@/features/notifications/ui/components/NotificationItem";
import { TeamPageHeader } from "../components/common/TeamPageHeader";
import { useTeamDashboard } from "../../context/TeamDashboardContext";


const TeamNotificationsPage: React.FC = () => {
    const { teamId } = useTeamDashboard();
    const { data: notificationsData, isLoading, isError } = useTeamNotificationsQuery(
        teamId || "",
        1,
        { enabled: !!teamId }
    );

    const teamNotifications = notificationsData?.notifications || [];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <TeamPageHeader
                icon={Bell}
                title="Team Notifications"
                subtitle="Stay updated with your team's tactical alerts and updates"
                noMargin={true}
            />

            <main className="flex-1 overflow-y-auto w-full px-4 md:px-6 pt-2 md:pt-4 pb-4 md:pb-8">
                <div className="space-y-4 w-full">
                    {!teamId ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                                <Inbox className="w-12 h-12 text-gray-700" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Team Detected</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                You need to join or create a team to receive team notifications.
                            </p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-red-500 mb-2">Signal Lost</h3>
                            <p className="text-red-400/80 max-w-xs mx-auto">
                                Failed to retrieve team notifications. Please try again.
                            </p>
                        </div>
                    ) : isLoading && teamNotifications.length === 0 ? (
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
            </main>
        </div>
    );
};

export default TeamNotificationsPage;
