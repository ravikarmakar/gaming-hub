import { motion } from "framer-motion";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinksProps {
  title: string;
  links: FooterLink[];
}

export const FooterLinks = ({ title, links }: FooterLinksProps) => {
  const linkVariants = {
    hover: {
      x: 5,
      transition: {
        type: "spring",
        stiffness: 300,
      }
    }
  };

  return (
    <div className="space-y-3">
      <motion.h3 
        className="text-lg font-bold font-orbitron text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h3>
      <ul className="space-y-1">
        {links.map((link, index) => (
          <motion.li 
            key={link.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.a
              href={link.href}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1 relative group"
              whileHover="hover"
              variants={linkVariants}
            >
              <span className="relative inline-block">
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </span>
            </motion.a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
