"use client";

import { getPosts, getUser } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/blog/PostCard";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/blog/ProfileForm";
import { useUser } from "@/hooks/use-user";
import { use, useState } from "react";
import { usePosts } from "@/hooks/use-posts";

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useUser(params.id);

  if (!user && !loading) {
    notFound();
  }

  const [tab, setTab] = useState<"published" | "drafts">("published");
  const { posts, loading: postsLoading } = usePosts(
    params.id,
    tab === "published"
  );

  // const userPosts = allPosts.filter((p) => p.authorId === user?.id);
  // const publishedPosts = userPosts.filter((p) => p.published);
  // const draftPosts = userPosts.filter((p) => !p.published);

  return (
    <>
      {user && !loading && (
        <section className="bg-card border-b">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <ProfileForm user={user!} />
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 md:px-6 py-12">
        <Tabs
          defaultValue="published"
          className="w-full"
          onValueChange={(v) => setTab(v as "published" | "drafts")}
        >
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="published">
              Published ({tab === "published" ? posts.length : "..."})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({tab === "drafts" ? posts.length : "..."})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-8">
            {postsLoading ? (
              <p>Loading...</p>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg">
                <h2 className="text-2xl font-semibold">No Published Posts</h2>
                <p className="mt-2 text-muted-foreground">
                  You haven't published any posts yet.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-8">
            {postsLoading ? (
              <p>Loading...</p>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg">
                <h2 className="text-2xl font-semibold">No Drafts</h2>
                <p className="mt-2 text-muted-foreground">
                  There are no draft posts.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
