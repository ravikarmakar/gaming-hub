import { Button } from "../../elements/Button"; // Import reusable Button component
import { LogIn, UserPlus } from "lucide-react"; // Icons for the buttons
import { Link } from "react-router-dom"; // Router links for navigation
import { motion } from "framer-motion"; // For smooth animations

export const AuthButtons = () => {
  return (
    <div className="flex items-center gap-4">
      {/* Login Button */}
      <Link to="/login">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button variant="auth" size="sm" className="flex text-white">
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
        </motion.div>
      </Link>

      {/* Sign Up Button */}
      <Link to="/signup">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button variant="auth" size="sm" className="flex text-white py-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </motion.div>
      </Link>
    </div>
  );
};
