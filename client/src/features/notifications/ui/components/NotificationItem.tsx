import React from "react";
import { motion } from "framer-motion";
import { Bell, Check, X, Calendar, Users, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Notification, useNotificationStore } from "../../store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const { markAsRead, performAction, isLoading } = useNotificationStore();
    const navigate = useNavigate();

    const getIcon = () => {
        switch (notification.type) {
            case "TEAM_INVITE":
            case "TEAM_JOIN_REQUEST":
            case "TEAM_LEAVE":
            case "TEAM_KICK":
                return <Users className="w-5 h-5 text-blue-400" />;
            case "EVENT_REGISTRATION":
            case "EVENT_REMINDER":
                return <Calendar className="w-5 h-5 text-purple-400" />;
            case "SYSTEM":
                return <Info className="w-5 h-5 text-teal-400" />;
            default:
                return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

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
            navigate(ROUTES.EVENT_DETAILS.replace(":eventId", notification.relatedData.eventId));
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleClick}
            className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${notification.status === "unread"
                ? "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40"
                : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
        >
            {notification.status === "unread" && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            )}

            <div className="flex gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${notification.status === "unread" ? "bg-purple-500/10" : "bg-white/5"
                    }`}>
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-bold truncate ${notification.status === "unread" ? "text-white" : "text-gray-300"
                            }`}>
                            {notification.content.title}
                        </h4>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                        {notification.content.message}
                    </p>

                    {notification.status !== "archived" && notification.actions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            {notification.actions.map((action, idx) => (
                                <Button
                                    key={idx}
                                    size="sm"
                                    variant={action.actionType === "ACCEPT" ? "default" : "ghost"}
                                    disabled={isLoading}
                                    onClick={(e) => handleAction(e, action.actionType)}
                                    className={`h-8 px-4 rounded-lg text-xs font-bold transition-all ${action.actionType === "ACCEPT"
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                                        }`}
                                >
                                    {action.actionType === "ACCEPT" && <Check className="w-3 h-3 mr-1.5" />}
                                    {action.actionType === "REJECT" && <X className="w-3 h-3 mr-1.5" />}
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    {notification.status === "archived" && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 mt-1">
                            <Check className="w-3 h-3" />
                            <span>Handled</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default NotificationItem;
