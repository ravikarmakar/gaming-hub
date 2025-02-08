import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface CommunityButtonProps {
  className: string;
  link: string;
  label: string;
  icon: React.ReactNode;
}

const CummintyButton = ({
  className,
  link,
  label,
  icon,
}: CommunityButtonProps) => {
  return (
    <Link to={link}>
      <motion.button
        className={`w-full sm:w-auto px-6 py-3 bg-transparent rounded-full text-md font-semibold sm:text-sm lg:text-md transition-all duration-200  hover:text-white shadow-md ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="flex items-center gap-2 justify-center">
          {label}
          {icon}
        </span>
      </motion.button>
    </Link>
  );
};

export default CummintyButton;
