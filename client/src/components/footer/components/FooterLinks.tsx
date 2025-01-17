interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinksProps {
  title: string;
  links: FooterLink[];
}

export const FooterLinks = ({ title, links }: FooterLinksProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-orbitron text-white">{title}</h3>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 group flex items-center"
            >
              <span className="relative">
                {link.label}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
