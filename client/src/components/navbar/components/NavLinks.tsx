import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  name: string;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavLink = ({
  href,
  name,
  isActive,
  onClick,
  className,
}: NavLinkProps) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors duration-200",
        "hover:text-white focus:outline-none focus-visible:ring-2",
        isActive ? "text-cyan-400" : "text-gray-300",
        className,
        // Add underline animation for desktop only
        "lg:after:absolute lg:after:left-0 lg:after:bottom-0 lg:after:h-0.5 lg:after:w-full lg:after:origin-center",
        "lg:after:scale-x-0 lg:hover:after:scale-x-100",
        "lg:after:transition-transform lg:after:duration-200 lg:after:ease-out",
        isActive
          ? "text-cyan-400 border-b-2 border-cyan-500"
          : "lg:after:bg-gray-300"
      )}
    >
      {name}
    </Link>
  );
};
