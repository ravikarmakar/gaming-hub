import { motion } from "framer-motion";
import { BlogPost } from "./blog";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-16"
    >
      <div className="flex items-center mb-8 space-x-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="text-white font-medium">{post.author.name}</p>
          <p className="text-gray-400 text-sm">{post.date}</p>
        </div>
      </div>

      <div className="prose prose-invert prose-orange max-w-none">
        <p className="text-xl text-gray-300 leading-relaxed mb-8">
          {post.excerpt}
        </p>
        <div className="text-gray-300 leading-relaxed">{post.content}</div>
      </div>
    </motion.article>
  );
}
