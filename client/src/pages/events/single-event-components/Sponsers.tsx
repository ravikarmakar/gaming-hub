import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const sponsors = [
  {
    tier: "Diamond",
    companies: [
      {
        name: "TechCorp Gaming",
        logo: "https://images.unsplash.com/photo-1560415755-bd80d06eda60?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Leading gaming hardware manufacturer",
      },
      {
        name: "Quantum Drinks",
        logo: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Premium gaming energy beverages",
      },
    ],
  },
  {
    tier: "Platinum",
    companies: [
      {
        name: "CyberNet ISP",
        logo: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=200&h=100",
        description: "High-speed gaming network provider",
      },
      {
        name: "PixelWear",
        logo: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Gaming apparel and merchandise",
      },
      {
        name: "StreamMax",
        logo: "https://images.unsplash.com/photo-1561089489-f13d5e730d72?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Streaming platform partner",
      },
    ],
  },
  {
    tier: "Gold",
    companies: [
      {
        name: "GameHub",
        logo: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Gaming community platform",
      },
      {
        name: "ByteSnacks",
        logo: "https://images.unsplash.com/photo-1561758033-7e924f619b47?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Gaming-themed snacks",
      },
      {
        name: "NeoTech",
        logo: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Gaming peripherals",
      },
      {
        name: "DataForce",
        logo: "https://images.unsplash.com/photo-1561070791-ab85611cb0bb?auto=format&fit=crop&q=80&w=200&h=100",
        description: "Cloud gaming services",
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function Sponsors() {
  return (
    <div className="bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Our Sponsors
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Partnering with industry leaders to bring you the ultimate gaming
            experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-16"
        >
          {sponsors.map((tier, tierIndex) => (
            <motion.div
              key={tierIndex}
              variants={itemVariants}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl -z-10" />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-4 mb-8"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
                  <h3
                    className={`text-2xl font-bold ${
                      tier.tier === "Diamond"
                        ? "text-blue-400"
                        : tier.tier === "Platinum"
                        ? "text-gray-300"
                        : "text-yellow-500"
                    }`}
                  >
                    {tier.tier} Sponsors
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {tier.companies.map((company, companyIndex) => (
                    <motion.div
                      key={companyIndex}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      <div className="relative bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 h-full">
                        <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-600 transition-all duration-300">
                          {company.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {company.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
