import {
  TwitterIcon,
  TwitchIcon,
  YoutubeIcon,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

export const FooterSocial = () => {
  const socialLinks = [
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: TwitchIcon, href: "#", label: "Twitch" },
    { icon: YoutubeIcon, href: "#", label: "YouTube" },
    { icon: MessageSquare, href: "#", label: "Discord" },
  ];

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
      }
    }
  };

  return (
    <div className="flex space-x-4">
      {socialLinks.map(({ icon: Icon, href, label }, index) => (
        <motion.a
          key={label}
          href={href}
          aria-label={label}
          className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-gray-800 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover="hover"
          variants={iconVariants}
        >
          <Icon size={18} />
        </motion.a>
      ))}
    </div>
  );
};
