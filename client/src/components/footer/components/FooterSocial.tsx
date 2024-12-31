import {
  TwitterIcon,
  TwitchIcon,
  YoutubeIcon,
  MessageSquare,
} from "lucide-react";

export const FooterSocial = () => {
  const socialLinks = [
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: TwitchIcon, href: "#", label: "Twitch" },
    { icon: YoutubeIcon, href: "#", label: "YouTube" },
    { icon: MessageSquare, href: "#", label: "Discord" }, // Using MessageSquare as an alternative for Discord
  ];

  return (
    <div className="flex space-x-4">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-cyan-500 hover:text-white transform hover:scale-110 transition-all duration-300 group"
        >
          <Icon size={20} className="group-hover:animate-pulse" />
        </a>
      ))}
    </div>
  );
};
