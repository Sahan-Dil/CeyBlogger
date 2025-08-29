import { getPosts, getUser } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/blog/PostCard";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  
  if (!user) {
    notFound();
  }

  const allPosts = await getPosts();
  const userPosts = allPosts.filter(p => p.authorId === user.id);
  const publishedPosts = userPosts.filter(p => p.published);
  const draftPosts = userPosts.filter(p => !p.published);

  return (
    <>
      <section className="bg-card border-b">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold">{user.name}</h1>
                    <p className="mt-2 text-lg text-muted-foreground max-w-xl">{user.bio}</p>
                    <div className="mt-4 flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <User className="h-4 w-4" />
                           <span>Author</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Mail className="h-4 w-4" />
                           <span>{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <Tabs defaultValue="published" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="published" className="mt-8">
            {publishedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publishedPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border rounded-lg">
                    <h2 className="text-2xl font-semibold">No Published Posts</h2>
                    <p className="mt-2 text-muted-foreground">This author hasn't published any posts yet.</p>
                </div>
            )}
          </TabsContent>
          <TabsContent value="drafts" className="mt-8">
            {draftPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {draftPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
             ) : (
                <div className="text-center py-16 border rounded-lg">
                    <h2 className="text-2xl font-semibold">No Drafts</h2>
                    <p className="mt-2 text-muted-foreground">There are no draft posts.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
