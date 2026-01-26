import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { User } from "@/features/auth/store/useAuthStore";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";

type DashboardButtonProps = {
  isSuperAdmin: boolean;
  hasAnyOrgRole: boolean;
  isLoading?: boolean;
  user: User | null;
  className?: string;
};

export const DashboardButton = ({
  isSuperAdmin,
  hasAnyOrgRole,
  isLoading,
  user,
  className,
}: DashboardButtonProps) => {
  const navigate = useNavigate();

  if (!user) return null;
  if (!isSuperAdmin && !hasAnyOrgRole) return null;

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-500" />
      <Button
        variant="outline"
        onClick={() => navigate(ORGANIZER_ROUTES.DASHBOARD)}
        className={cn(
          "relative w-full h-10 px-4 flex items-center gap-2 font-bold text-white transition-all bg-[#0a0514] border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/5 group-active:scale-95",
          "sm:w-auto sm:px-5 rounded-lg"
        )}
        disabled={isLoading}
      >
        <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        <span className="text-sm tracking-wide">
          {isSuperAdmin ? "Super Admin" : "Dashboard"}
        </span>
      </Button>
    </div>
  );
};
