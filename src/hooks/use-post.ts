import { useEffect, useState } from "react";

export const usePosts = (userId: string) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        const allPosts = await response.json();
        const userPosts = allPosts.filter(
          (p: { authorId: string }) => p.authorId === userId
        );
        setPosts(userPosts);
      } catch (err: any) {
        console.error("Failed to fetch posts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  return { posts, loading, error };
};
