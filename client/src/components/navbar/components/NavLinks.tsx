import { Link } from "react-router-dom";
import { memo } from "react";

interface NavLinksProps {
  className?: string;
  onClick?: () => void;
  href: string;
  name: string;
  isActive: boolean;
}

export const NavLink: React.FC<NavLinksProps> = memo(
  ({
    href,
    name,
    isActive,
    onClick,
  }: {
    href: string;
    name: string;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <Link
      to={href}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-audiowide font-medium transition-colors duration-300 ${
        isActive
          ? "text-cyan-400 border-b-2 border-cyan-400"
          : "text-gray-300 hover:text-cyan-400"
      }`}
    >
      {name}
    </Link>
  )
);
