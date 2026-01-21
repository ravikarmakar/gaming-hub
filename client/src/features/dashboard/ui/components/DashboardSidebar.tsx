import { Link, useLocation } from "react-router-dom";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/routes";
import {
  Sidebar,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

// const sectionOne = [
//   { label: "Profile", icon: User, href: "/dashboard/player" },
//   { label: "Team", icon: Users, href: "/dashboard/team" },
//   { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
// ];

const sectionTwo = [
  {
    label: "Upgrade",
    icon: StarIcon,
    href: ROUTES.UPGRADE,
  },
];

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

interface Props {
  sidebarItems: SidebarItem[];
}

export const DashboardSidebar = ({ sidebarItems }: Props) => {
  const pathname = useLocation();

  return (
    <Sidebar
      style={{ borderRight: "none" }}
      side="left"
      className="group-data-[side=left]:border-r-0"
    >
      <SidebarHeader className="text-white">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 px-2 pt-2">
          <img src="/logo.svg" height={36} width={36} alt="Gaminghub" />
          <p className="text-2xl font-semibold">Gaming Hub</p>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator className="opacity-10 text-[#5D6B68]" />
      </div>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "h-10 px-4 flex items-center gap-3 rounded-md transition-colors duration-200",
                    pathname.pathname === item.href
                      ? "bg-purple-900/40 text-white border border-purple-700/20"
                      : "hover:bg-purple-800/30 hover:text-white text-gray-300"
                  )}
                  isActive={pathname.pathname === item.href}
                >
                  <Link to={item.href}>
                    <item.icon className="text-purple-400 size-5" />
                    <span className="text-sm font-medium tracking-tight">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <div className="px-4 py-2">
        <Separator className="opacity-10 text-[#5D6B68]" />
      </div>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {sectionTwo.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "h-10 px-4 flex items-center gap-3 rounded-md transition-colors duration-200",
                    pathname.pathname === item.href
                      ? "bg-purple-900/50 text-white border border-purple-700"
                      : "hover:bg-purple-800/30 hover:text-white text-gray-300"
                  )}
                  isActive={pathname.pathname === item.href}
                >
                  <Link to={item.href}>
                    <item.icon className="w-5 h-5 text-purple-400" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter className="text-white">
        {/* <DashboardUserButton /> */}
      </SidebarFooter>
    </Sidebar>
  );
};
