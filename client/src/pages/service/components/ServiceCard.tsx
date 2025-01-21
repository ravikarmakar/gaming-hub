// import React from "react";
// import { motion } from "framer-motion";
// import { ServiceType } from "../types";

// const ServiceCard: React.FC<ServiceType> = ({
//   title,
//   description,
//   icon,
//   link,
//   features,
// }) => {
//   return (
//     <motion.div
//       className="bg-gray-800/95 rounded-lg p-8 text-center shadow-md backdrop-blur-10 transition-all hover:shadow-lg"
//       whileHover={{ y: -5 }}
//       initial={{ opacity: 0, y: 60 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
//     >
//       <div className="text-5xl text-red-500 mb-6">{icon}</div>
//       <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
//       <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
//       {features && features.length > 0 && (
//         <ul className="list-none space-y-2 mb-6">
//           {features.map((feature, idx) => (
//             <li key={idx} className="text-sm text-gray-400">
//               {feature}
//             </li>
//           ))}
//         </ul>
//       )}
//       <a
//         href={link}
//         className="text-red-500 hover:text-red-400 transition-colors font-medium"
//       >
//         Learn More →
//       </a>
//     </motion.div>
//   );
// };

// export default ServiceCard;

import React from "react";
import { motion } from "framer-motion";
import { ServiceType } from "../types";

const ServiceCard: React.FC<ServiceType> = ({
  title,
  description,
  icon,
  link,
  features,
}) => {
  return (
    <motion.div
      className="relative rounded-lg p-6 sm:p-8 text-center shadow-md bg-gray-700/20 backdrop-blur-lg transition-all hover:shadow-xl hover:-translate-y-2 
                 border border-transparent hover:border-[rgba(255,0,0,0.4)]"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {/* Icon */}
      <div className="text-4xl sm:text-5xl text-red-500 mb-4 sm:mb-6">
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
        {title}
      </h2>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
        {description}
      </p>

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="list-none space-y-2 mb-4 sm:mb-6">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="text-xs sm:text-sm text-gray-400 bg-gray-900/80 rounded-md px-3 py-1"
            >
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Link */}
      <a
        href={link}
        className="text-red-500 hover:text-red-400 transition-colors font-medium text-sm"
      >
        Learn More →
      </a>
    </motion.div>
  );
};

export default ServiceCard;
