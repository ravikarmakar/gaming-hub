import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { BlogPost } from "./blog";
import { Link } from "react-router-dom";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-orange-500/20 transition-all"
    >
      <Link to={`/blog/${post.id}`}>
        <div className="relative h-48 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full">
              {post.category}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm text-white">{post.author.name}</p>
                <p className="text-xs text-gray-400">{post.date}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {post.readTime}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
