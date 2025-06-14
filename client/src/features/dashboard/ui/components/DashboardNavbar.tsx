import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSidebar } from "@/components/ui/sidebar";
import ProfileMenu from "@/components/shared/ProfileMenu";

export const DashboardNavbar = () => {
  const { isMobile, state, toggleSidebar } = useSidebar();
  return (
    <nav className="z-20 flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 gap-x-2">
      <Button
        className="bg-gray-900 size-9 hover:bg-gray-800"
        onClick={toggleSidebar}
      >
        {state === "collapsed" || isMobile ? (
          <PanelLeftIcon className="text-white size-5" />
        ) : (
          <PanelLeftCloseIcon className="text-white size-5" />
        )}
      </Button>

      <ProfileMenu />
    </nav>
  );
};
