import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface QuickActionButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  hoverEffect?: boolean;
  className?: string;
}

const QuickActionButton = ({
  to,
  icon,
  label,
  hoverEffect = true,
  className,
}: QuickActionButtonProps) => {
  return (
    <Link to={to} className="w-full md:w-1/3 max-w-sm mx-auto">
      <motion.div
        whileHover={hoverEffect ? { scale: 1.02 } : {}}
        whileTap={hoverEffect ? { scale: 0.98 } : {}}
        className={`h-full bg-white/5 backdrop-blur-sm border border-white/10 py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 hover:bg-white/10 group ${className}`}
      >
        {icon}
        <span className="text-white/90 group-hover:text-white font-medium text-base">
          {label}
        </span>
      </motion.div>
    </Link>
  );
};

export default QuickActionButton;
