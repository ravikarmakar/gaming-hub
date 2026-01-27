import { Link, useLocation } from "react-router-dom";
import { StarIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

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
  matches?: string[];
}

interface Props {
  sidebarItems: SidebarItem[];
}

export const DashboardSidebar = ({ sidebarItems }: Props) => {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar
      style={{ borderRight: "none" }}
      side="left"
      className="group-data-[side=left]:border-r-0 bg-[#0F0720] border-r border-purple-500/10"
    >
      {/* Header with Logo */}
      <SidebarHeader className="text-white bg-transparent py-5 px-4">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5"
        >
          <img
            src="/logo.svg"
            height={32}
            width={32}
            alt="Gaming Hub"
          />
          <p className="text-xl font-bold text-white tracking-tight">
            Gaming Hub
          </p>
        </Link>
      </SidebarHeader>

      {/* Separator */}
      <div className="px-4 pb-3">
        <Separator className="bg-purple-500/10" />
      </div>

      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupContent className="px-3">
          <SidebarMenu className="space-y-0.5">
            {sidebarItems.map((item) => {
              const isMatch = (item: SidebarItem) =>
                pathname === item.href ||
                item.matches?.some(match => pathname === match || pathname.startsWith(match + "/")) ||
                (item.href !== '/' && pathname.startsWith(item.href + "/"));

              const isActive = isMatch(item) && !sidebarItems.some(other =>
                other.href !== item.href &&
                (isMatch(other) && (other.href.length > item.href.length || (other.matches && !item.matches)))
              );

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 px-3 flex items-center gap-3 rounded-md transition-all duration-200",
                      isActive
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    isActive={isActive}
                  >
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon
                        className={cn(
                          "size-[18px]",
                          isActive ? "text-purple-400" : "text-gray-400"
                        )}
                      />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Separator */}
      <div className="px-4 py-3">
        <Separator className="bg-purple-500/10" />
      </div>

      {/* Upgrade Section */}
      <SidebarGroup>
        <SidebarGroupContent className="px-3">
          <SidebarMenu>
            {sectionTwo.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 px-3 flex items-center gap-3 rounded-md transition-all duration-200",
                      isActive
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    isActive={isActive}
                  >
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon
                        className={cn(
                          "size-[18px]",
                          isActive ? "text-purple-400" : "text-gray-400"
                        )}
                      />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Footer */}
      <SidebarFooter className="text-white bg-transparent pb-4">
        <div className="px-4 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Gaming Hub
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
