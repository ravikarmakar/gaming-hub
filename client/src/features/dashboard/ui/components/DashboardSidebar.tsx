import { brand } from "@/config/brand";
import { Link, useLocation } from "react-router-dom";
import { StarIcon, PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
  const { setOpenMobile, toggleSidebar } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // Helper to check if an item matches the current path
  const isMatch = (item: SidebarItem) => {
    if (pathname === item.href) return true;
    if (item.matches) {
      for (const match of item.matches) {
        if (match.includes(':')) {
          // Escape static parts of the pattern and replace :param with [^/]+
          const escapedPattern = match
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/:(\w+)/g, '[^/]+');
          const pattern = new RegExp('^' + escapedPattern + '$');
          if (pattern.test(pathname)) return true;
        } else if (pathname === match || pathname.startsWith(match + "/")) {
          return true;
        }
      }
    }
    return item.href !== '/' && pathname.startsWith(item.href + "/");
  };

  // Identify the SINGLE best matching item (longest href match)
  const bestMatch = sidebarItems.reduce<SidebarItem | null>((best, current) => {
    if (!isMatch(current)) return best;
    if (!best) return current;
    return current.href.length > best.href.length ? current : best;
  }, null);

  return (
    <Sidebar
      style={{ borderRight: "none" }}
      side="left"
      collapsible="icon"
      className="group-data-[side=left]:border-r-0 border-r bg-[#0F0720] border-purple-500/10"
    >
      {/* Header with Logo */}
      <SidebarHeader className="text-white bg-transparent py-4 px-4 flex-row items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pt-4 group-data-[collapsible=icon]:gap-6">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-3 transition-all duration-200 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-white/5 group-data-[collapsible=icon]:rounded-xl"
        >
          <img
            src={brand.logo}
            height={32}
            width={32}
            alt={brand.name}
            className="group-data-[collapsible=icon]:size-6 transition-all"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-white tracking-tight leading-none whitespace-nowrap">
              {brand.name}
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-white/5 h-8 w-8 rounded-lg transition-colors group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
          onClick={toggleSidebar}
        >
          <PanelLeftCloseIcon className="w-5 h-5 group-data-[collapsible=icon]:hidden" />
          <PanelLeftIcon className="w-5 h-5 hidden group-data-[collapsible=icon]:block" />
        </Button>
      </SidebarHeader>

      {/* Separator */}
      <div className="px-4 pb-3 group-data-[collapsible=icon]:px-2">
        <Separator className="bg-purple-500/10" />
      </div>

      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupContent className="px-3 group-data-[collapsible=icon]:px-2">
          <SidebarMenu className="gap-1">
            {sidebarItems.map((item) => {
              const isActive = bestMatch?.href === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className={cn(
                      "h-12 px-4 flex items-center gap-4 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-auto",
                      isActive
                        ? "bg-purple-500/15 text-purple-300 font-medium shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    isActive={isActive}
                  >
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-4 w-full group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon
                        className={cn(
                          "size-6 shrink-0 transition-colors",
                          isActive ? "text-purple-400" : "text-gray-400 group-hover:text-gray-300"
                        )}
                      />
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
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
      <div className="px-4 py-3 group-data-[collapsible=icon]:px-2">
        <Separator className="bg-purple-500/10" />
      </div>

      {/* Upgrade Section */}
      <SidebarGroup>
        <SidebarGroupContent className="px-3 group-data-[collapsible=icon]:px-2">
          <SidebarMenu className="gap-1">
            {sectionTwo.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className={cn(
                      "h-10 px-3 flex items-center gap-3 rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      isActive
                        ? "bg-purple-500/15 text-purple-300 font-medium shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    isActive={isActive}
                  >
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon
                        className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          isActive ? "text-purple-400" : "text-gray-400 group-hover:text-gray-300"
                        )}
                      />
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
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
      <SidebarFooter className="text-white bg-transparent pb-4 gap-4">
        <div className="px-4 text-center group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Gaming Hub
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};