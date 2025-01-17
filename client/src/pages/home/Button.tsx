import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  text: string;
  icon: ReactNode;
  gradientFrom: string;
  gradientTo: string;
  hoverColor1: string;
  hoverColor2: string;
  link: string;
}

const HeaderButton = ({
  text,
  icon,
  gradientFrom,
  gradientTo,
  hoverColor1,
  hoverColor2,
  link,
}: ButtonProps) => {
  return (
    <Link to={link} className="w-full sm:w-auto">
      <motion.button
        whileHover={{
          scale: 1.15,
          boxShadow: `0 0 20px ${hoverColor1}, 0 0 40px ${hoverColor2}`,
          textShadow: `0 0 10px ${hoverColor1}`,
        }}
        whileTap={{ scale: 0.95 }}
        className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} text-white font-bold px-8 py-3 sm:px-10 sm:py-4 rounded-lg transition-all duration-300 tracking-wide uppercase text-sm sm:text-base lg:text-lg flex items-center justify-center`}
      >
        {icon}
        {text}
      </motion.button>
    </Link>
  );
};

export default HeaderButton;
