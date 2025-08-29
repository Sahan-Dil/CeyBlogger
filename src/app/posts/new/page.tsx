import { PostForm } from "@/components/blog/PostForm";

export default function NewPostPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Create a New Post</h1>
        <p className="text-muted-foreground">
          Fill out the form below to share your story with the world.
        </p>
      </div>
      <PostForm />
    </div>
  );
}
