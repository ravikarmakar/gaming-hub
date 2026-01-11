import { useState } from "react";
import { Loader2, LogOut, PlusCircle, User, UserCog } from "lucide-react";
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

import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import CreateTeamModal from "@/features/teams/ui/components/CreateTeamModal";

const ProfileMenu = () => {
  const navigate = useNavigate();

  const { user, logout, isLoading } = useAuthStore();

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const profileOptions: Array<{
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
  }> = [
    {
      name: "My Profile",
      icon: User,
      href: ROUTES.PLAYER_PROFILE.replace(":id", user?._id ?? ""),
    },
    ...(user?.teamId
      ? [
          {
            name: "Team Profile",
            icon: UserCog,
            href: ROUTES.TEAM_PROFILE.replace(":id", user.teamId),
          },
        ]
      : [
          {
            name: "Create Team",
            icon: PlusCircle,
            onClick: () => setIsCreateTeamOpen(true),
          },
        ]),
    ...(user?.teamId
      ? [
          {
            name: "Team Dashboard",
            icon: UserCog,
            href: ROUTES.TEAM_DASHBOARD,
          },
        ]
      : []),
  ];

  return (
    <>
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        setIsOpen={setIsCreateTeamOpen}
      />

      {isLoading ? (
        <Skeleton className="w-10 h-10 bg-gray-700 border-2 rounded-full border-purple-500/30" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10 border-2 cursor-pointer border-purple-500/30">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-sm font-semibold text-gray-300 bg-gray-700">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 text-white bg-gray-800 border shadow-lg border-purple-900/50 shadow-purple-900/20"
            align="end"
          >
            <DropdownMenuLabel className="p-3">
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 bg-gray-700 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="w-24 h-4 bg-gray-700" />
                    <Skeleton className="w-16 h-3 bg-gray-700" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 border-2 border-purple-500/30">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-sm font-semibold text-gray-300 bg-gray-700">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[150px] overflow-hidden whitespace-nowrap">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuGroup>
              {profileOptions.map((option) => (
                <DropdownMenuItem
                  key={option.name}
                  onClick={() => {
                    if (option.href) navigate(option.href);
                    else option.onClick?.();
                  }}
                  className={`flex items-center justify-between text-sm cursor-pointer px-3 py-2
            focus:bg-purple-800/20 focus:text-white transition-colors duration-200`}
                >
                  <div className="flex items-center gap-3">
                    <option.icon className="size-4" />
                    {option.name}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => logout()}
                disabled={isLoading}
                className={`flex items-center justify-between text-sm cursor-pointer px-3 py-2
                  focus:bg-purple-800/20 focus:text-white transition-colors duration-200`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging out...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={() => navigate(ROUTES.LOGIN)}
          className={`text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 focus-visible:ring-purple-900 shadow-md shadow-purple-900/20`}
        >
          Login
        </Button>
      )}
    </>
  );
};

export default ProfileMenu;
