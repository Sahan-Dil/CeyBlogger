"use client";
import { PostForm } from "@/components/blog/PostForm";
import { usePost } from "@/hooks/use-post";
import { use } from "react";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { post } = usePost(id);

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">
          Make changes to your post below and save them.
        </p>
      </div>
      {post && <PostForm post={post} />}
    </div>
  );
}
