import { motion } from "framer-motion";

const DecorativeBorder = () => {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-1"
      animate={{
        background: [
          "linear-gradient(to right, transparent, #a855f7, transparent)",
          "linear-gradient(to right, transparent, #7c3aed, transparent)",
          "linear-gradient(to right, transparent, #a855f7, transparent)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    ></motion.div>
  );
};

export default DecorativeBorder;
