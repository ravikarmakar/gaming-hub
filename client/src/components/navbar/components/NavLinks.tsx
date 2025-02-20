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
        "px-4 py-2 text-sm font-medium rounded-lg",
        "transition-colors duration-200",
        isActive
          ? "text-purple-500 bg-purple-500/10"
          : "text-gray-300 hover:text-purple-400",
        className
      )}
    >
      {name}
    </Link>
  );
};
