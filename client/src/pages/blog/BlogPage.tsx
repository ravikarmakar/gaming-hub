import { Search } from "lucide-react";
import { BlogGrid } from "./components/BlogGrid";
import PageLayout from "../PageLayout";

export default function BlogPage() {
  return (
    <PageLayout
      title=" Free Fire Blog"
      description=" Stay updated with the latest strategies, updates, and community
        highlights"
    >
      {/* Search bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full px-6 py-3 bg-gray-900 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pl-12"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Grid */}
        <BlogGrid />
      </div>
    </PageLayout>
  );
}
