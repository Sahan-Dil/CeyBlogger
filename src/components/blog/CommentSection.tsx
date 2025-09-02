"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { getToken } from "@/lib/api";
import { format } from "date-fns";

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

export function CommentSection({ postId }: { postId: string }) {
  const { user: authUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const token = getToken();
      if (!token) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setComments(data);
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const token = getToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      }
    );
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    const token = getToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent, parentId }),
      }
    );
    if (res.ok) {
      const reply = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c
        )
      );
      setReplyContent("");
      setReplyTo(null);
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-xl mb-4">Comments</h3>

      {/* Add Comment */}
      {authUser ? (
        <div className="mb-6">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button className="mt-2" onClick={handleAddComment}>
            Post Comment
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground">Login to add comments</p>
      )}

      {/* Comments List */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replyTo,
  setReplyTo,
  replyContent,
  setReplyContent,
  handleReply,
}: {
  comment: Comment;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (val: string) => void;
  handleReply: (id: string) => void;
}) {
  const { user } = useUser(comment.authorId);

  return (
    <div>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback>{user?.name?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{user?.name ?? "Unknown User"}</p>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.createdAt), "MMM d, yyyy HH:mm")}
            </span>
          </div>
          <p className="text-foreground/80">{comment.content}</p>
          <Button
            variant="link"
            size="sm"
            className="text-xs px-0"
            onClick={() => setReplyTo(comment.id)}
          >
            Reply
          </Button>

          {/* Reply input */}
          {replyTo === comment.id && (
            <div className="mt-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <Button size="sm" onClick={() => handleReply(comment.id)}>
                  Post Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 pl-6 border-l">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Separator className="my-4" />
    </div>
  );
}
