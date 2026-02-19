import { LayoutDashboard, Users, Trophy, Building2, MessageSquare, Settings, Activity } from "lucide-react";
import { ADMIN_ACCESS } from "./access";

const ADMIN_BASE_PATH = "/admin";

export const ADMIN_ROUTES = {
    DASHBOARD: `${ADMIN_BASE_PATH}/dashboard`,
    USERS: `${ADMIN_BASE_PATH}/users`,
    TEAMS: `${ADMIN_BASE_PATH}/teams`,
    ORGANIZERS: `${ADMIN_BASE_PATH}/organizers`,
    CHAT: `${ADMIN_BASE_PATH}/chat`,
    ACTIVITY: `${ADMIN_BASE_PATH}/activity`,
    SETTINGS: `${ADMIN_BASE_PATH}/settings`,
};

export const ADMIN_NAV_ITEMS = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: ADMIN_ROUTES.DASHBOARD,
        access: ADMIN_ACCESS.dashboard,
    },
    {
        title: "User Management",
        icon: Users,
        path: ADMIN_ROUTES.USERS,
        access: ADMIN_ACCESS.dashboard,
    },
    {
        title: "Team Management",
        icon: Trophy,
        path: ADMIN_ROUTES.TEAMS,
        access: ADMIN_ACCESS.dashboard,
    },
    {
        title: "Organizer Management",
        icon: Building2,
        path: ADMIN_ROUTES.ORGANIZERS,
        access: ADMIN_ACCESS.dashboard,
    },
    {
        title: "Support Chat",
        icon: MessageSquare,
        path: ADMIN_ROUTES.CHAT,
        access: ADMIN_ACCESS.dashboard,
    },
    {
        title: "Audit Logs",
        icon: Activity,
        path: ADMIN_ROUTES.ACTIVITY,
        access: ADMIN_ACCESS.dashboard,
    },
    {
        title: "Settings",
        icon: Settings,
        path: ADMIN_ROUTES.SETTINGS,
        access: ADMIN_ACCESS.dashboard,
    },
];
