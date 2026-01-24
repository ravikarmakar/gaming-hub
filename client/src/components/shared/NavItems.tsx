import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Flame,
  Gamepad2,
  Home,
  Trophy,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { name: "Home", icon: Home, href: ROUTES.HOME },
  {
    name: "Esports",
    icon: Gamepad2,
    hasDropdown: true,
    dropdownItems: [
      { name: "Find players", href: ROUTES.ALL_PLAYERS },
      { name: "Find team", href: ROUTES.ALL_TEAMS },
    ],
  },
  {
    name: "Tournaments",
    icon: Trophy,
    href: ROUTES.ALL_EVENTS,
  },
  {
    name: "Trending",
    icon: Flame,
    href: ROUTES.TRENDING,
  },
  {
    name: "Community",
    icon: Users,
    href: ROUTES.COMMUNITY,
  },
];

const NavItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  return (
    <div className={cn("flex items-center", isMobile ? "flex-col w-full gap-2" : "gap-1")}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.href ||
          (item.hasDropdown &&
            item.dropdownItems?.some(
              (drop) => location.pathname === drop.href
            ));

        const isThisCollapsibleOpen = openCollapsible === item.name;

        return (
          <div key={item.name} className={isMobile ? "w-full" : "relative px-1"}>
            {item.hasDropdown ? (
              isMobile ? (
                <Collapsible
                  open={isThisCollapsibleOpen}
                  onOpenChange={() =>
                    setOpenCollapsible(isThisCollapsibleOpen ? null : item.name)
                  }
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all rounded-xl cursor-pointer group",
                        isActive
                          ? "bg-purple-500/10 text-white"
                          : "text-purple-200/60 hover:text-white hover:bg-purple-500/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "text-purple-400/40")} />
                        {item.name}
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isThisCollapsibleOpen && "rotate-180")} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="flex flex-col gap-1 pl-12 py-2 pr-4">
                      {item.dropdownItems?.map((drop) => {
                        const isDropdownItemActive = location.pathname === drop.href;
                        return (
                          <Link
                            key={drop.name}
                            to={drop.href}
                            onClick={() => {
                              setOpenCollapsible(null);
                            }}
                            className={cn(
                              "flex items-center py-2.5 text-sm font-medium transition-colors group",
                              isDropdownItemActive ? "text-purple-400" : "text-purple-300/50 hover:text-purple-300"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/30 mr-3 group-hover:bg-purple-500 transition-colors" />
                            {drop.name}
                          </Link>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-full group outline-none",
                        isActive
                          ? "text-white bg-purple-500/10"
                          : "text-purple-200/70 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-purple-400" : "text-purple-400/40 group-hover:text-purple-400 transition-colors")} />
                      {item.name}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="p-2 min-w-[180px] bg-[#0a0514] border-purple-500/20 text-purple-100 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                  >
                    {item.dropdownItems?.map((drop) => (
                      <DropdownMenuItem
                        key={drop.name}
                        onClick={() => navigate(drop.href)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 cursor-pointer rounded-lg transition-colors focus:bg-purple-500/10 focus:text-white",
                          location.pathname === drop.href ? "bg-purple-500/10 text-white" : "text-purple-200/60"
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                        {drop.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Link
                to={item.href || "/"}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-full group",
                  isMobile
                    ? "px-4 py-3 h-12 rounded-xl text-base"
                    : "text-sm",
                  isActive
                    ? "text-white bg-purple-500/10"
                    : "text-purple-200/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-purple-400" : "text-purple-400/40 group-hover:text-purple-400 transition-colors")} />
                {item.name}

                {isActive && !isMobile && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-purple-500/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NavItems;
