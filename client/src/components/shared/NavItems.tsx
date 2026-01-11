import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
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

import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { name: "Home", icon: Home, href: "/" },
  {
    name: "Esports",
    icon: Gamepad2,
    hasDropdown: true,
    dropdownItems: [
      { name: "Find players", href: "/players" },
      // { name: "Adventure", href: "/adventure" },
      // { name: "RPG", href: "/rgp" },
      // { name: "Strategy", href: "/strategy" },
      // { name: "Sports", href: "/sports" },
    ],
  },
  {
    name: "Tournaments",
    icon: Trophy,
    href: "/tournaments",
  },
  {
    name: "Trending",
    icon: Flame,
    href: "/trending",
  },
  {
    name: "Community",
    icon: Users,
    href: "/community",
  },
];

const NavItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  return (
    <>
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
          <div key={item.name}>
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
                    <span
                      className={`flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                        isActive ? "text-purple-300" : "text-gray-300"
                      } hover:text-purple-300`}
                    >
                      <div className="flex items-center">
                        <span className="mr-1">
                          <Icon className="w-4 h-4" />
                        </span>
                        {item.name}
                      </div>
                      {isThisCollapsibleOpen ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <div className="flex flex-col pl-6">
                      {item.dropdownItems?.map((drop) => {
                        const isDropdownItemActive =
                          location.pathname === drop.href;
                        return (
                          <Link
                            key={drop.name}
                            to={drop.href}
                            onClick={() => {
                              setOpenCollapsible(null);
                            }}
                            className={`flex items-center py-2 text-sm font-medium transition-colors rounded-md ${
                              isDropdownItemActive
                                ? "text-purple-300"
                                : "text-gray-400"
                            } hover:text-purple-300`}
                          >
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
                    <span
                      className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                        isActive ? "text-purple-300" : "text-gray-300"
                      } hover:text-purple-300`}
                    >
                      <span className="mr-1">
                        <Icon className="w-4 h-4" />
                      </span>
                      {item.name}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="text-gray-200 bg-gray-800 border-gray-700">
                    {item.dropdownItems?.map((drop) => {
                      const isDropdownItemActive =
                        location.pathname === drop.href;
                      return (
                        <DropdownMenuItem
                          key={drop.name}
                          onClick={() => navigate(drop.href)}
                          className={`cursor-pointer ${
                            isDropdownItemActive
                              ? "bg-purple-700/20 text-white"
                              : "hover:bg-gray-700"
                          }`}
                        >
                          {drop.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Link
                to={item.href || "/"}
                onClick={() => {
                  setOpenCollapsible(null);
                }}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive ? "text-purple-300" : "text-gray-300"
                } hover:text-purple-300`}
              >
                <span className="mr-1">
                  <Icon className="w-4 h-4" />
                </span>
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </>
  );
};

export default NavItems;
