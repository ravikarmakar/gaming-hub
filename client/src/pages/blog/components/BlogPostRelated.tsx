import { motion } from "framer-motion";
import { BlogCard } from "./BlogCard";
import { blogPosts } from "./blogPosts";

interface BlogPostRelatedProps {
  currentPostId: string;
}

export function BlogPostRelated({ currentPostId }: BlogPostRelatedProps) {
  const relatedPosts = blogPosts
    .filter((post) => post.id !== currentPostId)
    .slice(0, 3);

  return (
    <div className="bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8 text-center"
        >
          Related Articles
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
