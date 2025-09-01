"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PostCard } from "./PostCard";
import type { Post } from "@/lib/types";
import { getPosts as fetchPosts } from "@/lib/data";

interface PostsFeedProps {
  initialPosts: Post[];
  initialCursor: string | null;
}

export function PostsFeed({ initialPosts, initialCursor }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPosts(8, nextCursor);
      setPosts((prev) => [...prev, ...res.posts]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Failed to load more posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {nextCursor && (
        <div className="mt-12 text-center">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More Posts"}
          </Button>
        </div>
      )}
    </>
  );
}
