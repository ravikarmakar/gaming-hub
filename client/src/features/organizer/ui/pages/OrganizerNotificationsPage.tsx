import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { Bell, Check, Clock, ShieldAlert, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";

const OrganizerNotificationsPage: React.FC = () => {
    const { currentOrg, notifications, fetchNotifications, markNotificationAsRead, isLoading } = useOrganizerStore();

    useEffect(() => {
        if (currentOrg?._id) {
            fetchNotifications(currentOrg._id);
        }
    }, [currentOrg?._id, fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case "ORGANIZATION_INVITE":
                return <Users className="w-5 h-5 text-blue-400" />;
            case "TEAM_INVITE":
                return <Trophy className="w-5 h-5 text-amber-400" />;
            case "SYSTEM":
                return <ShieldAlert className="w-5 h-5 text-rose-400" />;
            default:
                return <Bell className="w-5 h-5 text-violet-400" />;
        }
    };

    if (isLoading && !notifications) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        Organizer <span className="text-violet-500">Notifications</span>
                    </h1>
                </div>
                <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-4 py-1">
                    <span className="text-[10px] font-black tracking-widest uppercase">
                        {notifications?.filter(n => n.status === 'unread').length || 0} New
                    </span>
                </Badge>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {!notifications || notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/5">
                            <Bell className="w-8 h-8 text-white/20" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white/60">No alerts found</p>
                            <p className="text-sm text-white/30 tracking-tight">Everything is quiet on this front.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative group flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 ${notification.status === 'unread'
                                        ? 'bg-violet-500/5 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]'
                                        : 'bg-white/5 border border-white/5'
                                        } hover:bg-white/[0.08] hover:border-white/10`}
                                >
                                    <div className="shrink-0 mt-1">
                                        <div className={`p-3 rounded-2xl ${notification.status === 'unread' ? 'bg-violet-500/20' : 'bg-white/5'
                                            }`}>
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black italic uppercase text-sm tracking-tight text-white/90 group-hover:text-white transition-colors">
                                                {notification.content.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <p className="text-sm text-white/40 font-medium leading-relaxed group-hover:text-white/60 transition-colors">
                                            {notification.content.message}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {notification.status === 'unread' && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => markNotificationAsRead(notification._id)}
                                                className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white transition-all active:scale-90"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {notification.status === 'unread' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerNotificationsPage;
