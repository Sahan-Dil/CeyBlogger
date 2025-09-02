"use client";

import { usePost } from "@/hooks/use-post";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Heart, Share2, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/blog/CommentSection";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id;

  const { post } = usePost(postId);
  const { user: author } = useUser(post?.authorId!);
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = authUser?.id === post?.authorId;

  // Like state
  const [likesCount, setLikesCount] = useState(post?.likes ?? 0);
  const [liked, setLiked] = useState(false);

  // Fetch whether user already liked this post
  useEffect(() => {
    if (!authUser) return;

    async function fetchLikedStatus() {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/liked`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch like status");

        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {
        console.error(err);
      }
    }

    fetchLikedStatus();
  }, [authUser, postId]);

  // Update likesCount if post.likes changes
  useEffect(() => {
    setLikesCount(post?.likes ?? 0);
  }, [post?.likes]);

  const handleLike = async () => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to like this post.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ like: !liked }),
        }
      );

      if (!res.ok) throw new Error("Failed to update like");

      const updatedCount = await res.json(); // API returns updated count
      setLikesCount(updatedCount);
      setLiked(!liked);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;

    const token = getToken();
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to delete this post.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete post");

      toast({
        title: "Post Deleted",
        description: "Your post has been removed successfully.",
      });

      router.push("/");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {post && (
        <article>
          {/* Header */}
          <header className="relative h-[50vh] w-full">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="container relative mx-auto flex h-full flex-col justify-end px-4 md:px-6 pb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                {post.title}
              </h1>
              {author && (
                <div className="mt-4 flex items-center gap-4">
                  <Link
                    href={`/profile/${author.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={author.avatarUrl} />
                      <AvatarFallback>
                        {author.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white group-hover:text-primary-foreground/80">
                        {author.name}
                      </p>
                      <p className="text-sm text-white/80">
                        {format(new Date(post.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-3">
                <div
                  className="prose max-w-none prose-lg dark:prose-invert prose-p:text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-blockquote:border-primary"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <Separator className="my-12" />
                <CommentSection postId={post.id} />
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-8">
                <div className="p-4 border rounded-lg bg-card">
                  <h3 className="font-semibold mb-4 text-lg">Actions</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={liked ? "destructive" : "outline"}
                      className="w-full justify-start"
                      onClick={handleLike}
                    >
                      <Heart className="mr-2 h-4 w-4" />{" "}
                      {liked ? "You Liked This" : "Like post"} ({likesCount})
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {isAuthor && (
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/posts/${post.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Post</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this post? This
                              action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsDeleting(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                {/* Author & tags */}
                {author && (
                  <div className="p-4 border rounded-lg bg-card text-center">
                    <Link href={`/profile/${author.id}`}>
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={author.avatarUrl} />
                        <AvatarFallback>
                          {author.name?.substring(0, 2) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg mt-4 hover:text-primary">
                        {author.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {author.bio ? `${author.bio.substring(0, 80)}...` : ""}
                    </p>
                  </div>
                )}

                <div className="p-4 border rounded-lg bg-card">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Tag className="mr-2 h-4 w-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
