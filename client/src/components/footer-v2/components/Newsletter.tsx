import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="relative max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 focus:border-cyan-500/50 rounded-l-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none transition-colors"
            required
          />
          <motion.button
            type="submit"
            className="relative group px-6 rounded-r-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-white mix-blend-overlay"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 2, opacity: 0.2 }}
              transition={{ duration: 0.3 }}
            />
            <Send size={20} className="group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>

        {/* Glowing border effect */}
        <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50 group-hover:opacity-100 blur-sm transition-opacity" />
      </form>

      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-3 flex items-center space-x-2 text-green-400"
          >
            <CheckCircle size={16} />
            <span className="text-sm">Successfully subscribed!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
