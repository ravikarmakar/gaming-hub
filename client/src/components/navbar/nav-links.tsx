import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

interface NavLinksProps {
  className?: string;
  onClick?: () => void;
}

const links = [
  { href: "#games", label: "Games" },
  { href: "#tournaments", label: "Tournaments" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function NavLinks({ className, onClick }: NavLinksProps) {
  const handleSmoothScroll = useSmoothScroll();

  return (
    <nav className={cn("flex items-center space-x-8", className)}>
      {links.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          onClick={(e) => {
            handleSmoothScroll(e);
            onClick?.();
          }}
          className="text-gray-300 hover:text-cyan-400 font-audiowide transition-colors duration-200"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
