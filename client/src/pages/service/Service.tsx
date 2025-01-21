import { motion } from "framer-motion";
import ServiceCard from "./components/ServiceCard";
import { services } from "./data";

const ServicesPage = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute left-1/2 top-30 -translate-x-1/2 rounded-full opacity-60 blur-[100px] h-[400px] w-[500px] sm:h-[700px] sm:w-[900px] bg-red-500/20 pointer-events-none"></div>

      {/* Main Container*/}
      <motion.div
        className="max-w-6xl relative mx-auto px-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {/* Headers */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 tracking-tight">
            Our Services
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Elevate your gaming experience with our comprehensive suite of
            services
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.6, -0.05, 0.01, 0.99],
              }}
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ServicesPage;
