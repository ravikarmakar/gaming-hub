import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { BsDiscord } from "react-icons/bs";

interface SocialLoginProps {
  onGoogleLogin: () => void;
  onDiscordLogin?: () => void;
}

const buttonVariants = {
  hover: { scale: 1.01 },
  tap: { scale: 0.95 },
};

export const SocialLogin = ({
  onGoogleLogin,
  onDiscordLogin,
}: SocialLoginProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-xs text-gray-400 bg-[#0a0a0a]">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <motion.button
          type="button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onGoogleLogin}
          className="flex items-center justify-center p-2 transition-colors duration-200 border border-gray-700 rounded-lg bg-purple-800/10 hover:bg-purple-800/20"
        >
          <FcGoogle className="w-6 h-6" />
        </motion.button>

        <motion.button
          type="button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onDiscordLogin}
          className="flex items-center justify-center p-2 transition-colors duration-200 border border-gray-700 rounded-lg bg-purple-800/10 hover:bg-purple-800/20"
        >
          <BsDiscord className="w-6 h-6 text-[#5865F2]" />
        </motion.button>
      </div>
    </div>
  );
};
