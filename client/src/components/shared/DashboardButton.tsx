import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { ROUTES } from "@/lib/routes";

type DashboardButtonProps = {
  isSuperAdmin: boolean;
  hasAnyOrgRole: boolean;
  isLoading?: boolean;
};

export const DashboardButton = ({
  isSuperAdmin,
  hasAnyOrgRole,
  isLoading,
}: DashboardButtonProps) => {
  const navigate = useNavigate();

  if (!isSuperAdmin && !hasAnyOrgRole) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (isSuperAdmin) navigate(ROUTES.SUPER_ADMIN);
        else navigate("/org-dashboard");
      }}
      className="items-center hidden px-4 py-2 mr-4 font-medium text-white transition-all duration-200 ease-in-out border border-purple-600 md:inline-flex bg-gray-900/60 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-800 hover:text-white hover:shadow-lg hover:shadow-purple-800/40"
      disabled={isLoading}
    >
      <ShieldCheck className="w-4 h-4" />
      <span>{isSuperAdmin ? "Super Admin" : "Organizer"}</span>
    </Button>
  );
};
