import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { BsDiscord, BsGithub } from "react-icons/bs";

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onDiscordLogin?: () => void;
  onGithubLogin?: () => void;
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export const SocialLogin = ({
  onGoogleLogin,
  onDiscordLogin,
  onGithubLogin
}: SocialLoginProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-gray-400 bg-[#0a0a0a]">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onGoogleLogin}
          className="flex items-center justify-center p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors duration-200"
        >
          <FcGoogle className="w-6 h-6" />
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onDiscordLogin}
          className="flex items-center justify-center p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors duration-200"
        >
          <BsDiscord className="w-6 h-6 text-[#5865F2]" />
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onGithubLogin}
          className="flex items-center justify-center p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors duration-200"
        >
          <BsGithub className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};
