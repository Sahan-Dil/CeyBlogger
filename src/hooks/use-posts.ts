"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Post } from "@/lib/types";

interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
  fetchMore: () => void;
  refetch: () => void;
}

export function usePosts(authorId: string, published: boolean) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchPosts = async (reset = false) => {
    if (!authorId) return;

    try {
      setLoading(true);
      const url = new URL("/posts", process.env.NEXT_PUBLIC_API_URL);
      url.searchParams.set("authorId", authorId);
      url.searchParams.set("published", String(published));
      url.searchParams.set("limit", "10");
      if (!reset && cursor) {
        url.searchParams.set("cursor", cursor);
      }

      const res = await apiFetch<{ posts: Post[]; nextCursor: string | null }>(
        url.toString()
      );

      setPosts(reset ? res.posts : [...posts, ...res.posts]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorId, published]);

  const fetchMore = () => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };

  useEffect(() => {
    if (cursor) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  return {
    posts,
    loading,
    error,
    nextCursor,
    fetchMore,
    refetch: () => fetchPosts(true),
  };
}
