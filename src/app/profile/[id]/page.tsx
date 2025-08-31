import { getPosts, getUser } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/blog/PostCard";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/blog/ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser(params.id);

  if (!user) {
    notFound();
  }

  const allPosts = await getPosts();
  const userPosts = allPosts.filter((p) => p.authorId === user.id);
  const publishedPosts = userPosts.filter((p) => p.published);
  const draftPosts = userPosts.filter((p) => !p.published);

  return (
    <>
      <section className="bg-card border-b">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <ProfileForm user={user} />
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <Tabs defaultValue="published" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="published">
              Published ({publishedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({draftPosts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="published" className="mt-8">
            {publishedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedPosts.map((post) => (
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
            {draftPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {draftPosts.map((post) => (
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
