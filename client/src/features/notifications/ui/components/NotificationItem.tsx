import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Check, Calendar, Users, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";

import { Notification, useNotificationStore } from "../../store/useNotificationStore";
import { EVENT_ROUTES } from "@/features/events/lib";

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(({ notification }, ref) => {
    const { markAsRead, performAction, isLoading } = useNotificationStore();
    const navigate = useNavigate();

    const getTypeConfig = () => {
        switch (notification.type) {
            case "TEAM_INVITE":
                return { icon: <Users className="w-5 h-5 text-blue-400" />, label: "Team Invitation", textColor: "text-blue-400" };
            case "TEAM_JOIN_REQUEST":
                return { icon: <Users className="w-5 h-5 text-indigo-400" />, label: "Join Request", textColor: "text-indigo-400" };
            case "TEAM_LEAVE":
            case "TEAM_KICK":
                return { icon: <Users className="w-5 h-5 text-red-400" />, label: "Team Update", textColor: "text-red-400" };
            case "EVENT_REGISTRATION":
            case "EVENT_REMINDER":
                return { icon: <Calendar className="w-5 h-5 text-purple-400" />, label: "Tournament", textColor: "text-purple-400" };
            case "ORGANIZATION_INVITE":
                return { icon: <Bell className="w-5 h-5 text-amber-400" />, label: "Org Invite", textColor: "text-amber-400" };
            case "SYSTEM":
                return { icon: <Info className="w-5 h-5 text-teal-400" />, label: "System", textColor: "text-teal-400" };
            default:
                return { icon: <Bell className="w-5 h-5 text-gray-400" />, label: "Notification", textColor: "text-gray-400" };
        }
    };

    const typeConfig = getTypeConfig();

    const handleAction = async (e: React.MouseEvent, actionType: string) => {
        e.stopPropagation();
        await performAction(notification._id, actionType);
    };

    const handleClick = () => {
        if (notification.status === "unread") {
            markAsRead(notification._id);
        }

        // Redirect logic
        if (notification.relatedData?.teamId) {
            navigate(`/dashboard/team`); // Redirect to team dashboard for team events
        } else if (notification.relatedData?.eventId) {
            navigate(EVENT_ROUTES.TOURNAMENT_DETAILS.replace(":eventId", notification.relatedData.eventId));
        }
    };

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onClick={handleClick}
            className={`relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer group backdrop-blur-md ${notification.status === "unread"
                ? "bg-purple-500/[0.03] border-purple-500/20 hover:border-purple-500/40 shadow-[0_4px_20px_rgba(139,92,246,0.03)]"
                : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                }`}
        >
            {notification.status === "unread" && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            )}

            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex items-start gap-4 min-w-0">
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 relative ${notification.status === "unread"
                        ? "bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/15"
                        : "bg-white/5 border-white/5 group-hover:border-white/10"
                        }`}>
                        {notification.sender && (
                            <img
                                src={notification.sender.avatar}
                                alt={notification.sender.username}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0514] z-10"
                            />
                        )}
                        <div className="scale-75 sm:scale-90">
                            {typeConfig.icon}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                            <div className="flex flex-row items-center gap-2 min-w-0">
                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] ${typeConfig.textColor}`}>
                                    {typeConfig.label}
                                </span>
                                {notification.sender && (
                                    <span className="text-[10px] sm:text-[11px] text-purple-400/50 font-medium truncate flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        {notification.sender.username}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 whitespace-nowrap font-mono self-start sm:self-center opacity-40">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                        </div>

                        <h4 className={`text-sm sm:text-[15px] font-bold tracking-tight transition-colors truncate mb-1 ${notification.status === "unread" ? "text-white" : "text-gray-300 group-hover:text-white"
                            }`}>
                            {notification.content.title}
                        </h4>

                        <p className="text-xs text-gray-400/80 leading-snug line-clamp-2 opacity-70 mb-3">
                            {notification.content.message}
                        </p>

                        {notification.status !== "archived" && notification.actions.length > 0 && (
                            <div className="flex items-center gap-2">
                                {notification.actions.map((action, idx) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={action.actionType === "ACCEPT" ? "default" : "ghost"}
                                        disabled={isLoading}
                                        onClick={(e) => handleAction(e, action.actionType)}
                                        className={`h-7 px-3 rounded-lg text-[10px] font-bold transition-all ${action.actionType === "ACCEPT"
                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                                            }`}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {notification.status === "archived" && (
                    <div className="flex-shrink-0 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/[0.03] border border-emerald-500/10 text-[10px] font-black tracking-wider text-emerald-500/60">
                        <Check className="w-3 h-3" />
                        <span>Handled</span>
                    </div>
                )}
            </div>

            {/* Mobile Handled Status */}
            {notification.status === "archived" && (
                <div className="flex sm:hidden items-center gap-1.5 text-[9px] font-bold text-emerald-500/50 mt-3 pt-3 border-t border-white/5">
                    <Check className="w-3 h-3" />
                    <span>HANDLED</span>
                </div>
            )}
        </motion.div>
    );
});

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
