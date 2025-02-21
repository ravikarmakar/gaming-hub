import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Twitch, Youtube, MessageSquare, Globe } from 'lucide-react';

export const SocialLinks = () => {
  const socialLinks = [
    { icon: Twitter, color: '#1DA1F2', label: 'Twitter' },
    { icon: Twitch, color: '#9146FF', label: 'Twitch' },
    { icon: Youtube, color: '#FF0000', label: 'YouTube' },
    { icon: MessageSquare, color: '#5865F2', label: 'Discord' },
    { icon: Globe, color: '#00DC82', label: 'Website' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {socialLinks.map(({ icon: Icon, color, label }) => (
        <motion.a
          key={label}
          href="#"
          aria-label={label}
          className="relative group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 rounded-lg bg-[var(--social-color)] opacity-20 group-hover:opacity-30 transition-opacity"
            style={{ '--social-color': color } as React.CSSProperties}
          />
          <div className="relative w-10 h-10 rounded-lg bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-gray-400 group-hover:text-[var(--social-color)] transition-colors border border-gray-700/50 group-hover:border-[var(--social-color)]/50"
            style={{ '--social-color': color } as React.CSSProperties}
          >
            <Icon size={20} />
          </div>
        </motion.a>
      ))}
    </div>
  );
};
