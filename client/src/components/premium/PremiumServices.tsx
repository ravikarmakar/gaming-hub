import { motion } from "framer-motion";
import { Crown, Gamepad2, Trophy, Gift } from "lucide-react";

const premiumPlans = [
  {
    name: "Free Trial",
    price: "0",
    duration: "14 Days",
    icon: Gift,
    features: [
      "Access to Basic Games",
      "Join Community Forums",
      "Watch Live Streams",
      "Basic Profile Features",
    ],
    highlight: false,
    badge: "START HERE",
    color: "from-[#4f46e5] to-[#60efff]",
  },
  {
    name: "Pro Gamer",
    price: "9.99",
    duration: "Monthly",
    icon: Gamepad2,
    features: [
      "All Free Features",
      "Premium Game Access",
      "Priority Server Queue",
      "Custom Profile Themes",
      "5 Tournament Entries",
    ],
    highlight: false,
    badge: "POPULAR",
    color: "from-[#00ff87] to-[#60efff]",
  },
  {
    name: "Elite",
    price: "19.99",
    duration: "Monthly",
    icon: Crown,
    features: [
      "All Pro Features",
      "Exclusive Game Content",
      "Private Team Servers",
      "Premium Badge",
      "Unlimited Tournament Entries",
      "24/7 Priority Support",
    ],
    highlight: true,
    badge: "BEST VALUE",
    color: "from-[#ff3d87] to-[#ffa64d]",
  },
  {
    name: "Legend",
    price: "39.99",
    duration: "Monthly",
    icon: Trophy,
    features: [
      "All Elite Features",
      "Early Game Access",
      "Custom Server Hosting",
      "Pro Team Features",
      "Coaching Sessions",
      "Exclusive Merch Discounts",
      "VIP Event Access",
    ],
    highlight: false,
    badge: "ULTIMATE",
    color: "from-[#f21361] to-[#ff9190]",
  },
];

const PremiumServices = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d] via-[#150b2e] to-[#0a0f1d]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#4f46e510,transparent 100px)] opacity-10" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00ff87] via-[#60efff] to-[#00ff87] text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Level Up Your Gaming Experience
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Choose your perfect plan and unlock a world of premium gaming
            features, exclusive content, and epic rewards
          </motion.p>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {premiumPlans.map(
            (
              {
                name,
                price,
                duration,
                icon: Icon,
                features,
                highlight,
                badge,
                color,
              },
              index
            ) => (
              <motion.div
                key={name}
                className={`relative ${
                  highlight
                    ? "bg-gradient-to-br from-[#1a103c]/90 via-[#2a1356]/90 to-[#1a103c]/90 border-[#ff3d87]/30"
                    : "bg-gradient-to-br from-[#151c3b]/80 via-[#1c1333]/80 to-[#151c3b]/80 border-[#4f46e5]/30"
                } backdrop-blur-sm rounded-xl p-6 border hover:border-opacity-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-${
                  color.split("-")[2]
                }/10 group`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Badge */}
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${color} text-white`}
                    >
                      {badge}
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${color} p-4 shadow-lg shadow-${
                      color.split("-")[2]
                    }/20 group-hover:shadow-${
                      color.split("-")[2]
                    }/30 transition-all duration-500`}
                  >
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-white">$</span>
                    <span className="text-4xl font-bold text-white">
                      {price}
                    </span>
                    <span className="text-gray-400">/{duration}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {features.map((feature, index) => (
                    <li
                      key={`${name}-feature-${index}`}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color} shadow-sm shadow-${
                          color.split("-")[2]
                        }/20`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-500 bg-gradient-to-r ${color} hover:shadow-lg hover:shadow-${
                    color.split("-")[2]
                  }/20 text-white`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default PremiumServices;
