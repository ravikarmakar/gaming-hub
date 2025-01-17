import { blogPosts } from "./blogPosts";

export function useBlogPost(id: string | undefined) {
  if (!id) return null;
  return blogPosts.find((post) => post.id === id);
}
