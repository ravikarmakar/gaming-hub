import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import CummintyButton from "./components/CummintyButton";

const CommunitySection = () => {
  const categories = [
    { id: "all", name: "All Games", link: "/community" },
    { id: "action", name: "Action", link: "/community/action" },
    { id: "blogs", name: "Blogs", link: "/community/blogs" },
    { id: "strategy", name: "Strategy", link: "/community/strategy" },
    { id: "sports", name: "Sports", link: "/community/sports" },
  ];

  const communities = [
    {
      id: "1",
      name: "Elden Ring Masters",
      members: 15000,
      category: "action",
      image:
        "https://images.unsplash.com/photo-1614728185886-b1e0fd62354c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description:
        "Join fellow Tarnished in their journey through the Lands Between",
    },
    {
      id: "2",
      name: "Valorant Tactics",
      members: 25000,
      category: "strategy",
      image:
        "https://images.unsplash.com/photo-1611575269895-217214f47254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description:
        "Strategic discussions and team coordination for Valorant players",
    },
    {
      id: "3",
      name: "FIFA Champs",
      members: 18000,
      category: "sports",
      image:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description: "Dive into competitive football gaming with FIFA pros.",
    },
    {
      id: "4",
      name: "Skyrim Adventurers",
      members: 12000,
      category: "rpg",
      image:
        "https://images.unsplash.com/photo-1582408938350-969b6ccf0aa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description:
        "Explore Tamriel with Skyrim enthusiasts and share your journeys.",
    },
    {
      id: "5",
      name: "Apex Legends Elite",
      members: 20000,
      category: "action",
      image:
        "https://images.unsplash.com/photo-1617005718673-12115f3ba46e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description:
        "Join intense battle royale action with the Apex Legends community.",
    },
    {
      id: "6",
      name: "Chess Tacticians",
      members: 30000,
      category: "strategy",
      image:
        "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description: "Sharpen your strategic thinking with fellow chess players.",
    },
    {
      id: "7",
      name: "NBA Gamers",
      members: 15000,
      category: "sports",
      image:
        "https://images.unsplash.com/photo-1517816428104-721e167afdf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description:
        "Compete in basketball gaming tournaments with NBA enthusiasts.",
    },
    {
      id: "8",
      name: "Witcher Fans Unite",
      members: 14000,
      category: "rpg",
      image:
        "https://images.unsplash.com/photo-1610226036820-e1bf00ab5c63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      description:
        "Follow Geralt’s adventures and share RPG experiences in The Witcher world.",
    },
  ];

  const blogs = [
    {
      id: "1",
      title: "Mastering React for Modern Web Development",
      description:
        "A comprehensive guide to building scalable web applications using React and its ecosystem.",
      author: "John Doe",
      date: "2025-01-15",
      category: "Web Development",
      image:
        "https://images.unsplash.com/photo-1593642634443-44adaa06623a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    },
    {
      id: "2",
      title: "The Art of Photography: Tips and Tricks",
      description:
        "Learn how to capture stunning photos with these practical photography tips and techniques.",
      author: "Jane Smith",
      date: "2025-01-10",
      category: "Photography",
      image:
        "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    },
    {
      id: "3",
      title: "Exploring the World of Machine Learning",
      description:
        "Dive into the basics of machine learning, from algorithms to real-world applications.",
      author: "Alice Brown",
      date: "2025-01-12",
      category: "AI & Machine Learning",
      image:
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    },
    {
      id: "4",
      title: "Travel Hacks for Budget-Friendly Adventures",
      description:
        "Discover how to travel the world without breaking the bank with these simple hacks.",
      author: "Mark Wilson",
      date: "2025-01-18",
      category: "Travel",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-6 blur-[120px] h-[600px] w-[600px] bg-emerald-900/5"></div>

      <div className="absolute left-1/2 top-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-6 blur-[120px] h-[600px] w-[600px] bg-emerald-900/20"></div>

      {/* Main Container */}
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
          className="text-center mb-12"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 tracking-tight">
            Communities
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Connect with players who share your passion
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          {categories.map((category) => (
            <Link to={category.link} key={category.id}>
              <motion.button
                key={category.id}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full border-none bg-[rgba(255,255,255,0.1)] text-white cursor-pointer text-sm sm:text-base transition-all duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.2)] `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Blogs */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-5 sm:px-0 mt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              className="bg-emerald-900/25 rounded-3xl overflow-hidden backdrop-blur-lg"
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="relative w-full h-40">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl text-gray-100 mb-2">{blog.author}</h3>
                <p className="text-gray-400 text-sm mb-4">{blog.description}</p>
                <div className="text-gray-500 text-sm mb-4">{blog.date}</div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <CummintyButton
                    link={"/#"}
                    className="border bg-emerald-600 hover:bg-emerald-500"
                    label="Read"
                    icon={<ArrowUpRight size={20} />}
                  />

                  <CummintyButton
                    link={"/#"}
                    className="border border-emerald-600 text-emerald-500 hover:bg-emerald-500"
                    label="More"
                    icon={<ArrowUpRight size={20} />}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Content - Community */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {communities.map((community) => (
            <motion.div
              key={community.id}
              className="bg-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden backdrop-blur-lg border border-[rgba(255,255,255,0.1)]"
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <img
                src={community.image}
                alt={community.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl text-gray-100 mb-2">{community.name}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {community.description}
                </p>
                <div className="text-gray-500 text-sm mb-4">
                  {community.members.toLocaleString()} members
                </div>
                <motion.button
                  className="w-full py-3 bg-indigo-900/60 text-white rounded-lg text-base transition-all duration-200 hover:bg-indigo-900/80"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Community
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CommunitySection;
