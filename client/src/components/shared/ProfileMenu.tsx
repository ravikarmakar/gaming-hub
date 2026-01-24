import { useState } from "react";
import { Loader2, LogOut, PlusCircle, User, UserCog, Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
import CreateTeamModal from "@/features/teams/ui/components/CreateTeamModal";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const profileOptions = [
    {
      name: "My Profile",
      icon: User,
      href: ROUTES.PLAYER_PROFILE.replace(":id", user?._id ?? ""),
      color: "text-blue-400",
    },
    ...(user?.teamId
      ? [
        {
          name: "Team Profile",
          icon: UserCog,
          href: ROUTES.TEAM_PROFILE.replace(":id", user.teamId),
          color: "text-purple-400",
        },
        {
          name: "Team Dashboard",
          icon: Settings,
          href: ROUTES.TEAM_DASHBOARD,
          color: "text-indigo-400",
        },
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
  ];

  return (
    <>
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        setIsOpen={setIsCreateTeamOpen}
      />

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
                  onClick={() => {
                    if (option.href) navigate(option.href);
                    else option.onClick?.();
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
              onClick={() => logout()}
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
          onClick={() => navigate(ROUTES.LOGIN)}
          className="relative overflow-hidden group px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-full shadow-lg shadow-purple-600/20 transition-all duration-300 active:scale-95"
        >
          <span className="relative z-10 text-sm">Join Now</span>
        </Button>
      )}
    </>
  );
};

export default ProfileMenu;
