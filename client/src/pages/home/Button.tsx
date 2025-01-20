import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  text: string;
  icon: ReactNode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  hoverColor1: string;
  hoverColor2: string;
  link: string;
}

const HeaderButton = ({
  text,
  icon,
  color,
  hoverColor1,
  hoverColor2,
  link,
}: ButtonProps) => {
  return (
    <Link to={link} className="w-full sm:w-auto">
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: `0 0 20px ${hoverColor1}, 0 0 40px ${hoverColor2}`,
          textShadow: `0 0 10px ${hoverColor1}`,
        }}
        whileTap={{ scale: 0.95 }}
        className={`${color} text-white font-bold px-4 py-6 sm:px-10 sm:py-4 rounded-lg transition-all duration-300 tracking-wide uppercase text-sm sm:text-base lg:text-lg flex items-center justify-center`}
      >
        {icon}
        {text}
      </motion.button>
    </Link>
  );
};

export default HeaderButton;
