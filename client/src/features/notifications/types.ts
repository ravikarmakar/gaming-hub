export interface NotificationAction {
    label: string;
    actionType: "ACCEPT" | "REJECT" | "VIEW";
    payload: Record<string, unknown>;
}

export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        username: string;
        avatar: string;
    } | null;
    type: "TEAM_INVITE" | "TEAM_JOIN_REQUEST" | "TEAM_LEAVE" | "TEAM_KICK" | "EVENT_REMINDER" | "EVENT_REGISTRATION" | "ORGANIZATION_INVITE" | "SYSTEM" | "ROUND_CREATED" | "GROUP_CREATED";
    content: {
        title: string;
        message: string;
    };
    status: "unread" | "read" | "archived";
    relatedData?: {
        teamId?: string;
        eventId?: string;
        orgId?: string;
        groupId?: string;
        inviteId?: string;
    };
    actions: NotificationAction[];
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        unreadCount: number;
    };
}