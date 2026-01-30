import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, PlusCircle, User, Settings, Bell, UserCog, Building, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useOrganizerStore } from "@/features/organizer/store/useOrganizerStore";
import { TEAM_ROUTES } from "@/features/teams/lib/routes";
import { useTeamStore } from "@/features/teams/store/useTeamStore";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "@/features/organizer/lib/access";
import { TEAM_ACCESS } from "@/features/teams/lib/access";
import { PLAYER_ROUTES } from "@/features/player/lib/routes";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const { setIsCreateOrgOpen } = useOrganizerStore();
  const { setIsCreateTeamOpen } = useTeamStore();

  const { can } = useAccess();

  const canViewOrgDashboard = user?.orgId && can(ORG_ACTIONS_ACCESS[ORG_ACTIONS.viewDashboardButton]);
  const canViewTeamDashboard = user?.teamId && can(TEAM_ACCESS.dashboard);

  const profileOptions = [
    {
      name: "My Profile",
      icon: User,
      href: PLAYER_ROUTES.PLAYER_DETAILS.replace(":id", user?._id ?? ""),
      color: "text-blue-400",
    },
    ...(user?.teamId
      ? [
        {
          name: "Team Profile",
          icon: UserCog,
          href: TEAM_ROUTES.PROFILE.replace(":id", user.teamId),
          color: "text-purple-400",
        },
        ...(canViewTeamDashboard ? [{
          name: "Team Dashboard",
          icon: Settings,
          href: TEAM_ROUTES.DASHBOARD,
          color: "text-indigo-400",
        }] : []),
      ]
      : [
        {
          name: "Create Team",
          icon: PlusCircle,
          onClick: () => setIsCreateTeamOpen(true),
          color: "text-emerald-400",
        },
      ]),
    {
      name: "Notifications",
      icon: Bell,
      href: ROUTES.NOTIFICATIONS,
      color: "text-amber-400",
    },
    ...(user?.canCreateOrg && !user?.orgId
      ? [
        {
          name: "Create Organization",
          icon: PlusCircle,
          onClick: () => setIsCreateOrgOpen(true),
          color: "text-purple-400",
        },
      ]
      : []),
    ...(user?.orgId
      ? [
        {
          name: "Organization Profile",
          icon: Building,
          href: ORGANIZER_ROUTES.PROFILE.replace(":id", user.orgId),
          color: "text-purple-400",
        },
        ...(canViewOrgDashboard ? [{
          name: "Organization Dashboard",
          icon: LayoutDashboard,
          href: ORGANIZER_ROUTES.DASHBOARD.replace(":id", user.orgId),
          color: "text-indigo-400",
        }] : []),
      ]
      : []),
    {
      name: "Settings",
      icon: UserCog,
      href: PLAYER_ROUTES.PLAYER_SETTINGS.replace(":id", user?._id ?? ""),
      color: "text-blue-400",
    }
  ];

  return (
    <>
      {isLoading ? (
        <Skeleton className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-full" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group relative outline-none">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-0 group-hover:opacity-50 transition duration-300" />
              <Avatar className="relative w-10 h-10 border-2 border-purple-500/20 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                <AvatarImage src={user.avatar} alt={user.username} className="object-cover" />
                <AvatarFallback className="bg-[#0a0514] text-purple-200 font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-72 p-2 bg-[#0a0514]/95 backdrop-blur-xl border border-purple-500/20 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
          >
            <DropdownMenuLabel className="p-4 mb-1">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="bg-purple-900/50 text-purple-100 font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-base font-bold text-white truncate leading-tight">
                    {user.username}
                  </p>
                  <p className="text-xs text-purple-400/70 truncate font-mono mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-purple-500/10 mx-2" />

            <DropdownMenuGroup className="py-1">
              {profileOptions.map((option) => (
                <DropdownMenuItem
                  key={option.name}
                  onSelect={(e) => {
                    if (!option.href) {
                      e.preventDefault();
                      // Apply 150ms timeout for Create Organization to allow menu to close
                      if (option.name === "Create Organization") {
                        setTimeout(() => option.onClick?.(), 150);
                      } else {
                        setTimeout(() => option.onClick?.(), 100);
                      }
                    }
                  }}
                  onClick={() => {
                    if (option.href) navigate(option.href);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors focus:bg-purple-500/10 focus:text-white"
                >
                  <option.icon className={cn("w-4.5 h-4.5", option.color)} />
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-purple-500/10 mx-2" />

            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              disabled={isLoading}
              className="flex items-center gap-3 px-3 py-2.5 mt-1 text-sm font-medium rounded-lg cursor-pointer text-red-400 transition-colors focus:bg-red-500/10 focus:text-red-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Log out</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={() => navigate(AUTH_ROUTES.LOGIN)}
          className="relative overflow-hidden group px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-full shadow-lg shadow-purple-600/20 transition-all duration-300 active:scale-95"
        >
          <span className="relative z-10 text-sm">Join Now</span>
        </Button>
      )}
    </>
  );
};

export default ProfileMenu;
