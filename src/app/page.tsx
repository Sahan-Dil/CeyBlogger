import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/blog/PostCard";
import { getPosts, getFilters } from "@/lib/data";
import { ArrowRight, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostsFeed } from "@/components/blog/PostsFeed";
import { FeaturedReadButton } from "@/components/blog/FeaturedReadButton";
import { SearchAndFilter } from "@/components/blog/SearchAndFilter";
import striptags from "striptags";

export default async function Home() {
  // First load: latest 9 posts
  const { posts: allPosts, nextCursor } = await getPosts(9);
  const featuredPost = allPosts[0];
  const recentPosts = allPosts.slice(1); // 8 posts

  // Fetch filter options
  const filters = await getFilters();

  const hasPosts = allPosts.length > 0;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh]">
        {hasPosts ? (
          // Featured post available
          <div className="relative w-full h-full bg-primary/20">
            <div className="absolute inset-0">
              <img
                src={featuredPost?.imageUrl}
                alt={featuredPost?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="container relative mx-auto h-full flex flex-col justify-center px-4 md:px-6">
              <h1 className="text-4xl md:text-6xl font-bold max-w-3xl text-primary-foreground">
                {featuredPost?.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/80">
                {striptags(featuredPost?.content || "").slice(0, 150)}...
              </p>
              <div className="mt-8">
                <FeaturedReadButton postId={featuredPost?.id || ""} />
              </div>
            </div>
          </div>
        ) : (
          // Fallback when no posts available
          <div className="flex items-center justify-center w-full h-full bg-primary/20">
            <div className="text-center px-4 md:px-6">
              <h1 className="text-4xl md:text-5xl font-bold text-pretty">
                Welcome to CeyBlogger
              </h1>
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-clip">
                Discover the latest trends, insights, and stories from our
                authors. Explore articles on technology, design, lifestyle, and
                more.
                {""}
                No posts are available yet. Please check back later or explore
                our other content.
              </p>
            </div>
          </div>
        )}
      </section>

      {hasPosts && (
        <div className="container mx-auto px-4 md:px-6 py-12">
          {/* Search and Filter Component */}
          <SearchAndFilter
            initialPosts={recentPosts}
            initialCursor={nextCursor}
            filters={filters}
          />
        </div>
      )}
    </div>
  );
}
