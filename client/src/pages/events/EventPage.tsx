import React, { useEffect, useState } from "react";
// import HeaderNavbar from "./HeaderNavbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Trophy,
  Calendar,
  DollarSign,
} from "lucide-react";
import { tags } from "@/lib/constants";
import FeaturedEvents from "./FeaturedEvents";

import AllEvents from "./AllEvents";
import Footer from "@/components/footer/Footer";
import DecorativeBorder from "./single-event-components/DecorativeBorder";

// Types
interface Filters {
  eventType: "all" | "free" | "paid";
  eventDate: "last month" | "this month" | "next month" | "all" | "today";
  prizePool: string;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// CustomSelect Component
const CustomSelect = ({
  name,
  options,
  value,
  icon,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  icon: React.ReactNode;
  onChange: (name: string, value: string) => void;
}) => (
  <motion.div className="relative group" variants={fadeInUp}>
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
      {icon}
    </div>
    <motion.select
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full appearance-none bg-black/60 backdrop-blur-sm text-white px-4 py-2 pl-10 pr-10 rounded-lg
               border border-purple-500/30 hover:border-purple-500 focus:border-purple-500 focus:ring-1
               focus:ring-purple-500 focus:outline-none transition-all duration-200"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-900">
          {option.label}
        </option>
      ))}
    </motion.select>
    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 pointer-events-none" />
  </motion.div>
);

// FilterTag Component
export const FilterTag = ({ text }: { text: string }) => (
  <motion.span
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:bg-purple-500/20 cursor-pointer transition-all"
  >
    {text}
  </motion.span>
);

// Tags Component
export const Tags = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-wrap gap-2 justify-center lg:pt-6 p-3"
    >
      {tags.map((tag, index) => (
        <motion.div key={index} variants={fadeInUp} custom={index}>
          <FilterTag text={tag} />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Main EventHeader Component
const EventPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    eventType: "all",
    eventDate: "all",
    prizePool: "",
  });

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      if (isMobileView) {
        setIsFiltersVisible(false); // Mobile: hide filters
      } else {
        setIsFiltersVisible(true); // Desktop: show filters
      }
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // const handleFilterChange = (name: string, value: string) => {
  //   setFilters((prevFilters) => ({
  //     ...prevFilters,
  //     [name]: value,
  //   }));
  // };

  // console.log(filters);

  return (
    <>
      {/* <HeaderNavbar /> */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative w-full min-h-[220px] lg:min-h-[340px] overflow-hidden bg-black"
      >
        {/* Background Effects */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor: ["rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)"],
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black to-transparent" />
        </motion.div>

        {/* Content Container */}
        <motion.div
          className="relative z-10 container mx-auto px-4 py-8 md:py-16"
          variants={staggerContainer}
        >
          <div className="flex flex-col items-center space-y-4 md:space-y-6">
            {/* Title Section */}
            <motion.div className="text-center space-y-2" variants={fadeInUp}>
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 tracking-tight"
                animate={{
                  backgroundPosition: ["0%", "100%"],
                  opacity: [0, 1],
                }}
                transition={{
                  backgroundPosition: { duration: 8, repeat: Infinity },
                  opacity: { duration: 1 },
                }}
              >
                HUNT YOUR EVENTS
              </motion.h1>
            </motion.div>

            {/* Search and Filters Container */}
            <motion.div className="w-full max-w-4xl" variants={fadeInUp}>
              {/* Search Bar */}
              <motion.div
                className="relative w-full mb-4"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                <motion.input
                  type="text"
                  className="w-full bg-black/60 backdrop-blur-sm text-white px-4 py-3 pl-10 rounded-lg
                           border border-purple-600/30 hover:border-purple-500 focus:border-purple-500
                           focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all duration-200
                           placeholder:text-gray-500"
                  placeholder="Search tournaments, games, or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Mobile Filter Toggle */}
              {isMobile && (
                <motion.button
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2
                           bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30
                           text-white hover:bg-purple-500/30 transition-all duration-200 mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isFiltersVisible ? "close" : "filter"}
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isFiltersVisible ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Filter className="w-4 h-4" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <span>
                    {isFiltersVisible ? "Hide Filters" : "Show Filters"}
                  </span>
                </motion.button>
              )}

              {/* Filters Section */}
              <AnimatePresence>
                {(!isMobile || isFiltersVisible) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { duration: 0.3 },
                        opacity: { duration: 0.3, delay: 0.1 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.3 },
                        opacity: { duration: 0.2 },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-3 gap-3 md:w-3/4 mx-auto"
                      variants={staggerContainer}
                    >
                      <CustomSelect
                        name="eventType"
                        value={filters.eventType}
                        icon={<Trophy className="w-4 h-4" />}
                        onChange={(name, value) =>
                          setFilters((prev) => ({ ...prev, [name]: value }))
                        }
                        options={[
                          { value: "all", label: "All Events" },
                          { value: "free", label: "Free Events" },
                          { value: "paid", label: "Paid Events" },
                        ]}
                      />
                      <CustomSelect
                        name="eventDate"
                        value={filters.eventDate}
                        icon={<Calendar className="w-4 h-4" />}
                        onChange={(name, value) =>
                          setFilters((prev) => ({ ...prev, [name]: value }))
                        }
                        options={[
                          { value: "all", label: "Any Date" },
                          { value: "today", label: "Today" },
                          { value: "this month", label: "This Month" },
                          { value: "next month", label: "Next Month" },
                        ]}
                      />
                      <CustomSelect
                        name="prizePool"
                        value={filters.prizePool}
                        icon={<DollarSign className="w-4 h-4" />}
                        onChange={(name, value) =>
                          setFilters((prev) => ({ ...prev, [name]: value }))
                        }
                        options={[
                          { value: "", label: "Any Prize Pool" },
                          { value: "0-1000", label: "0 - 1,000" },
                          { value: "1000-5000", label: "1,000 - 5,000" },
                          { value: "5000+", label: "5,000+" },
                        ]}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Decorative Border */}
        <DecorativeBorder />
      </motion.div>

      {/* Tags Section */}
      <Tags />

      {/* All Events Render here */}
      <AllEvents />

      {/* Suggestions Events */}

      <FeaturedEvents />
      <Footer />
    </>
  );
};

export default EventPage;
