import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star, Share2 } from "lucide-react";

type ActionButtonProps = {
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType; // Icon component type
  activeBg: string;
  inactiveBg: string;
  activeColor: string;
  inactiveColor: string;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  isActive,
  onClick,
  icon: Icon,
  activeBg,
  inactiveBg,
  activeColor,
  inactiveColor,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-4 rounded-full backdrop-blur-lg transition-all duration-300 shadow-lg ${
        isActive ? activeBg : inactiveBg
      }`}
    >
      <motion.div
        animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
        className={`w-5 h-5 ${isActive ? activeColor : inactiveColor}`}
      >
        <Icon fill={isActive ? "currentColor" : "none"} />
      </motion.div>
    </motion.button>
  );
};

const QuickAction = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="flex space-x-4">
      {/* Like Button */}
      <ActionButton
        isActive={isLiked}
        onClick={() => setIsLiked(!isLiked)}
        icon={Heart}
        activeBg="bg-rose-500/20"
        inactiveBg="bg-zinc-800/50"
        activeColor="text-rose-500"
        inactiveColor="text-zinc-400"
      />

      {/* Star Rating Button */}
      <ActionButton
        isActive={isRated}
        onClick={() => setIsRated(!isRated)}
        icon={Star}
        activeBg="bg-yellow-500/20"
        inactiveBg="bg-zinc-800/50"
        activeColor="text-yellow-500"
        inactiveColor="text-zinc-400"
      />

      {/* Share Button */}
      <div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="p-4 rounded-full bg-zinc-800/50 backdrop-blur-lg transition-all duration-300 hover:bg-zinc-700"
        >
          <Share2 className="w-6 h-6 text-zinc-400" />
        </motion.button>
        {isCopied && <span className="text-sm text-green-500">Copied!</span>}
      </div>
    </div>
  );
};

export default QuickAction;
