"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post, Author, FilterOptions } from "@/lib/types";
import { getPosts as fetchPosts } from "@/lib/data";

// Disable SSR for PostCard to prevent hydration issues
const PostCard = dynamic(
  () => import("./PostCard").then((mod) => ({ default: mod.PostCard })),
  {
    ssr: false,
  }
);

interface SearchAndFilterProps {
  initialPosts: Post[];
  initialCursor: string | null;
  filters: FilterOptions;
}

export function SearchAndFilter({
  initialPosts,
  initialCursor,
  filters,
}: SearchAndFilterProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Apply filters
  const applyFilters = async (
    search?: string,
    authorId?: string,
    tag?: string,
    reset?: boolean
  ) => {
    setLoading(true);
    setError(null);

    try {
      const searchValue = reset ? "" : search ?? searchTerm;
      const authorValue = reset ? "" : authorId ?? selectedAuthor;
      const tagValue = reset ? "" : tag ?? selectedTag;

      const hasFilters = Boolean(searchValue || authorValue || tagValue);
      setIsFiltered(hasFilters);

      const { posts: newPosts, nextCursor: newCursor } = await fetchPosts(
        8,
        undefined,
        searchValue,
        authorValue,
        tagValue
      );

      setPosts(newPosts);
      setNextCursor(newCursor);

      if (reset) {
        setSearchTerm("");
        setSelectedAuthor("");
        setSelectedTag("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      applyFilters(value);
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);
  };

  // Load more posts (pagination)
  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    setError(null);

    try {
      const { posts: morePosts, nextCursor: newCursor } = await fetchPosts(
        8,
        nextCursor,
        searchTerm,
        selectedAuthor,
        selectedTag
      );

      setPosts((prev) => [...prev, ...morePosts]);
      setNextCursor(newCursor);
    } catch (err) {
      console.error(err);
      setError("Failed to load more posts");
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    applyFilters("", "", "", true);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-12 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search posts by title or content..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
            <Select
              value={selectedAuthor}
              onValueChange={(value) => {
                setSelectedAuthor(value);
                applyFilters(undefined, value);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Author" />
              </SelectTrigger>
              <SelectContent>
                {filters.authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedTag}
              onValueChange={(value) => {
                setSelectedTag(value);
                applyFilters(undefined, undefined, value);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                {filters.tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset button - only show when filters are active */}
        {isFiltered && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={loading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Posts Section Title */}
      <h2 className="text-3xl font-bold mb-8">
        {isFiltered ? "Filtered Posts" : "Recent Posts"}
      </h2>

      {/* Loading state */}
      {loading && posts.length === 0 && (
        <div className="text-center py-8">
          <p>Loading posts...</p>
        </div>
      )}

      {/* No posts found */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isFiltered
              ? "No posts found matching your filters."
              : "No posts available."}
          </p>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          {/* Load More Button */}
          {nextCursor && (
            <div className="mt-12 text-center">
              <Button onClick={loadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
