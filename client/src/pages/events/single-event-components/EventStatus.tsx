import { motion } from "framer-motion";
import { UserPlus, Lock, PlayCircle, Clock } from "lucide-react"; // Importing Lucide icons

const EventStatus = ({ status }) => {
  // Status-based styles and icons
  const statusStyles = {
    "registration-open": {
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
      iconColor: "text-green-400",
      icon: <UserPlus className="w-6 h-6 text-green-400" />,
      label: "Registration Open",
    },
    "Registration Closed": {
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      iconColor: "text-red-400",
      icon: <Lock className="w-6 h-6 text-red-400" />,
      label: "Registration Closed",
    },
    "Ongoing Tournament": {
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      iconColor: "text-blue-400",
      icon: <PlayCircle className="w-6 h-6 text-blue-400" />,
      label: "Ongoing Tournament",
    },
    "Coming Soon": {
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      iconColor: "text-yellow-400",
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
      label: "Coming Soon",
    },
  };

  const currentStyle = statusStyles[status] || statusStyles["Coming Soon"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`flex items-center justify-center py-3 px-6 rounded-lg shadow-md ${currentStyle.bgColor}`}
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
          className="mr-3"
        >
          {currentStyle.icon}
        </motion.span>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-lg ${currentStyle.textColor}`}
        >
          {currentStyle.label}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default EventStatus;
