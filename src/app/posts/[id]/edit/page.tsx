import { PostForm } from "@/components/blog/PostForm";
import { getPost } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">
          Make changes to your post below and save them.
        </p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
