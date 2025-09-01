"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Post } from "@/lib/types";

interface UsePostResult {
  post: Post | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePost(postId?: string): UsePostResult {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(!!postId);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);

    try {
      const url = new URL(`/posts/${postId}`, process.env.NEXT_PUBLIC_API_URL);
      const data = await apiFetch<Post>(url.toString());
      setPost(data);
    } catch (err: any) {
      console.error("Error fetching post:", err);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}
