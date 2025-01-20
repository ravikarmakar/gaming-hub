import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { memo } from "react";

export const Logo = memo(() => (
  <motion.div whileHover={{ scale: 1.1 }}>
    <Link to="/" className="flex items-center space-x-2 text-white">
      <Gamepad2 className="hidden md:block w-8 h-8 text-cyan-400" />
      <span className="text-xl font-bold font-orbitron">GameHub</span>
    </Link>
  </motion.div>
));
