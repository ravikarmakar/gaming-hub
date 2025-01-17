import { motion } from "framer-motion";
import { Trophy, Users, Clock, Tag } from "lucide-react";

export function EventDetails() {
  return (
    <div className="relative container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        <div>
          <h2 className="text-3xl font-bold text-purple-400 mb-6">
            Event Details
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            Join us for the most anticipated gaming event of the year! Cyber
            Thunder 2024 brings together elite gamers from around the world to
            compete in multiple game titles for glory and incredible prizes.
          </p>

          <div className="space-y-4">
            {[
              { icon: Trophy, text: "Multiple Game Categories" },
              { icon: Users, text: "500+ Participants Expected" },
              { icon: Clock, text: "72 Hours of Non-Stop Gaming" },
              { icon: Tag, text: "₹10,00,000 Prize Pool" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-gray-300"
              >
                <item.icon className="w-5 h-5 text-purple-400" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 rounded-2xl border border-purple-500/20"
        >
          <h3 className="text-2xl font-bold text-purple-400 mb-6">
            Registration Status
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Registration Closes In
              </div>
              <div className="text-4xl font-bold text-white">14 Days</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Slots Remaining</div>
              <div className="text-4xl font-bold text-white">42/500</div>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
              Register Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/////////////////////////////

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Trophy,
//   Users,
//   Clock,
//   Gamepad,
//   ChevronRight,
//   Globe,
//   Zap,
// } from "lucide-react";

// // Types
// interface EventFeature {
//   icon: React.ElementType;
//   label: string;
//   value: string;
//   color: string;
// }

// interface RegistrationStats {
//   daysLeft: number;
//   totalSlots: number;
//   remainingSlots: number;
//   registrationEndDate: string;
// }

// interface Props {
//   eventStats: RegistrationStats;
// }

// const GamingEventPortal: React.FC<Props> = ({ eventStats }) => {
//   const [hoverFeature, setHoverFeature] = useState<number | null>(null);

//   // Animation variants defined within component
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//       },
//     },
//   };

//   const glowVariants = {
//     initial: { scale: 0.8, opacity: 0.5 },
//     animate: {
//       scale: 1.2,
//       opacity: [0.4, 0.2, 0.4],
//       transition: {
//         duration: 3,
//         repeat: Infinity,
//         ease: "easeInOut",
//       },
//     },
//   };

//   const floatVariants = {
//     initial: { y: 0 },
//     animate: {
//       y: [-10, 10],
//       transition: {
//         duration: 4,
//         repeat: Infinity,
//         repeatType: "reverse",
//         ease: "easeInOut",
//       },
//     },
//   };

//   const features: EventFeature[] = [
//     {
//       icon: Trophy,
//       label: "Prize Pool",
//       value: "₹10,00,000",
//       color: "from-amber-500 to-yellow-500",
//     },
//     {
//       icon: Users,
//       label: "Players",
//       value: "500+",
//       color: "from-cyan-500 to-blue-500",
//     },
//     {
//       icon: Clock,
//       label: "Duration",
//       value: "72h",
//       color: "from-purple-500 to-pink-500",
//     },
//     {
//       icon: Gamepad,
//       label: "Games",
//       value: "5+",
//       color: "from-green-500 to-emerald-500",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-black text-white overflow-hidden">
//       {/* Background Effects */}
//       <motion.div
//         className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.15),transparent_80%)]"
//         variants={glowVariants}
//         initial="initial"
//         animate="animate"
//       />

//       <div className="relative container mx-auto px-4 py-12 lg:py-24">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="grid lg:grid-cols-2 gap-12 items-center"
//         >
//           {/* Left Content Section */}
//           <div className="space-y-12">
//             <motion.div variants={itemVariants} className="space-y-4">
//               <motion.div
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm"
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <Zap className="w-4 h-4 text-yellow-500" />
//                 <span className="text-sm font-medium">Live Registration</span>
//               </motion.div>

//               <h1 className="text-5xl md:text-6xl font-bold">
//                 <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
//                   Cyber Thunder
//                 </span>
//                 <span className="block mt-2">2024</span>
//               </h1>

//               <p className="text-xl text-gray-400 max-w-xl">
//                 Experience the future of competitive gaming in this
//                 groundbreaking tournament series.
//               </p>
//             </motion.div>

//             {/* Features Grid */}
//             <motion.div
//               className="grid grid-cols-2 gap-4"
//               variants={itemVariants}
//             >
//               {features.map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   className="relative p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
//                   onHoverStart={() => setHoverFeature(index)}
//                   onHoverEnd={() => setHoverFeature(null)}
//                   whileHover={{ y: -5 }}
//                 >
//                   <motion.div
//                     className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.color} opacity-0`}
//                     animate={{
//                       opacity: hoverFeature === index ? 0.1 : 0,
//                     }}
//                     transition={{ duration: 0.3 }}
//                   />
//                   <div className="relative space-y-3">
//                     <feature.icon className="w-6 h-6 text-white/80" />
//                     <div>
//                       <div className="text-2xl font-bold">{feature.value}</div>
//                       <div className="text-sm text-gray-400">
//                         {feature.label}
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           </div>

//           {/* Right Registration Section */}
//           <motion.div
//             variants={floatVariants}
//             initial="initial"
//             animate="animate"
//             className="relative"
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
//               animate={{
//                 opacity: [0.3, 0.15, 0.3],
//                 scale: [1, 1.1, 1],
//               }}
//               transition={{
//                 duration: 4,
//                 repeat: Infinity,
//                 repeatType: "reverse",
//               }}
//             />

//             <motion.div
//               className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
//               variants={itemVariants}
//             >
//               <div className="space-y-8">
//                 <div>
//                   <div className="flex items-center gap-2 mb-2">
//                     <Globe className="w-4 h-4 text-blue-500" />
//                     <span className="text-sm text-gray-400">
//                       Registration Status
//                     </span>
//                   </div>
//                   <div className="space-y-6">
//                     {/* Time Remaining */}
//                     <div>
//                       <div className="flex justify-between mb-2">
//                         <span className="text-sm text-gray-400">
//                           Time Remaining
//                         </span>
//                         <span className="text-sm text-gray-400">
//                           {eventStats.registrationEndDate}
//                         </span>
//                       </div>
//                       <div className="text-3xl font-bold mb-2">
//                         {eventStats.daysLeft} Days Left
//                       </div>
//                       <motion.div className="h-1 bg-white/10 rounded-full overflow-hidden">
//                         <motion.div
//                           className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
//                           initial={{ width: 0 }}
//                           animate={{ width: "75%" }}
//                           transition={{ duration: 1, delay: 0.5 }}
//                         />
//                       </motion.div>
//                     </div>

//                     {/* Slots */}
//                     <div>
//                       <div className="flex justify-between mb-2">
//                         <span className="text-sm text-gray-400">
//                           Available Slots
//                         </span>
//                         <span className="text-sm text-gray-400">
//                           {eventStats.remainingSlots}/{eventStats.totalSlots}
//                         </span>
//                       </div>
//                       <motion.div className="h-1 bg-white/10 rounded-full overflow-hidden">
//                         <motion.div
//                           className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
//                           initial={{ width: 0 }}
//                           animate={{
//                             width: `${
//                               (eventStats.remainingSlots /
//                                 eventStats.totalSlots) *
//                               100
//                             }%`,
//                           }}
//                           transition={{ duration: 1, delay: 0.7 }}
//                         />
//                       </motion.div>
//                     </div>
//                   </div>
//                 </div>

//                 <motion.button
//                   className="w-full group relative"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200" />
//                   <div className="relative flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-black text-white font-medium">
//                     Register Now
//                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                   </div>
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default GamingEventPortal;
