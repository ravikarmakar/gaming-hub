import React, { useState } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FooterNewsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
    }, 2000);
  };

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-lg font-bold font-orbitron text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Join Us
      </motion.h3>
      <motion.p 
        className="text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Get gaming news & updates
      </motion.p>

      <form onSubmit={handleSubmit} className="relative">
        <motion.div 
          className="flex"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-l-lg py-2 px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-200"
            required
          />
          <motion.button
            type="submit"
            className="px-4 bg-cyan-500 text-white rounded-r-lg hover:bg-cyan-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-0 mt-2 text-sm text-cyan-400"
            >
              Thanks for subscribing!
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};
