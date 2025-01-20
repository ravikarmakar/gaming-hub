import { motion } from "framer-motion";
import { UserPlus, Lock, PlayCircle, Clock } from "lucide-react"; // Importing Lucide icons

interface EventStatusProps {
  status: string;
}

const EventStatus = ({ status }: EventStatusProps) => {
  // Status-based styles and icons
  const statusStyles = {
    "registration-open": {
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
      iconColor: "text-green-400",
      icon: (
        <UserPlus className="w-6 h-6 text-green-400 md:w-8 md:h-8 lg:h-6 lg:w-6" />
      ),
      label: "Registration Open",
    },
    "registration-closed": {
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      iconColor: "text-red-400",
      icon: <Lock className="w-6 h-6 text-red-400 md:w-8 md:h-8" />,
      label: "Registration Closed",
    },
    "ongoing-event": {
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      iconColor: "text-blue-400",
      icon: <PlayCircle className="w-6 h-6 text-blue-400 md:w-8 md:h-8" />,
      label: "Ongoing Tournament",
    },
    "coming-soon": {
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      iconColor: "text-yellow-400",
      icon: (
        <Clock className="w-6 h-6 text-yellow-400 md:w-8 md:h-8 lg:h-10 lg:w-10" />
      ),
      label: "Coming Soon",
    },
  };

  const currentStyle =
    statusStyles[status as keyof typeof statusStyles] ||
    statusStyles["coming-soon"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`flex items-center justify-center py-4 px-4 md:py-3 md:px-4 lg:py-3 lg:px-4 rounded-lg shadow-md ${currentStyle.bgColor}`}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center"
      >
        {/* Icon */}
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mr-2 flex-shrink-0"
        >
          {currentStyle.icon}
        </motion.span>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-base md:text-lg lg:text-lg font-medium ${currentStyle.textColor}`}
        >
          {currentStyle.label}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default EventStatus;
