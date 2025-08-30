"use client";

import { useState, useEffect } from "react";
import type { Comment as CommentType, User } from "@/lib/types";
import { getComments, getUser } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";

type CommentWithAuthor = CommentType & { author: User | undefined };

function CommentItem({ comment }: { comment: CommentWithAuthor }) {
  if (!comment.author) return null;

  return (
    <div className="flex items-start gap-4">
      <Link href={`/profile/${comment.author.id}`}>
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={comment.author.avatarUrl}
            alt={comment.author.name}
          />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${comment.author.id}`}
            className="font-semibold hover:underline"
          >
            {comment.author.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {format(new Date(comment.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <p className="mt-1 text-foreground/90">{comment.content}</p>
      </div>
    </div>
  );
}

export function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      setIsLoading(true);
      const fetchedComments = await getComments(postId);
      const commentsWithAuthors = await Promise.all(
        fetchedComments.map(async (comment: CommentType) => {
          const author = await getUser(comment.authorId);
          return { ...comment, author };
        })
      );
      setComments(commentsWithAuthors);
      setIsLoading(false);
    }
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    // Simulate API call to add a comment
    await new Promise((resolve) => setTimeout(resolve, 750));

    const addedComment: CommentWithAuthor = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: user.id,
      content: newComment,
      createdAt: new Date().toISOString(),
      author: user,
    };

    setComments([addedComment, ...comments]);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Comments ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={handleAddComment}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <Card className="text-center">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              <Link href="/login" className="text-primary underline">
                Log in
              </Link>{" "}
              to post a comment.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-muted"></div>
              <div className="h-4 w-3/4 rounded bg-muted"></div>
            </div>
          </div>
          <div className="flex items-start gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </div>
          </div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
