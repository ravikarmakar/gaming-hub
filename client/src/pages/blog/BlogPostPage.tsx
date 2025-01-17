import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BlogPostContent } from "./components/BlogPostContent";
import { BlogPostHeader } from "./components/BlogPostHeader";
import { BlogPostRelated } from "./components/BlogPostRelated";

import { useBlogPost } from "./components/useBlogPost";
import { useEffect } from "react";

export default function BlogPostPage() {
  const { id } = useParams();
  const post = useBlogPost(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20"
    >
      <BlogPostHeader post={post} />
      <BlogPostContent post={post} />
      <BlogPostRelated currentPostId={post.id} />
    </motion.div>
  );
}
