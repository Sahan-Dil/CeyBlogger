"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Post } from "@/lib/types";
import { getTags } from "@/lib/data";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { getToken } from "@/lib/api";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long.")
    .max(100),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  imageUrl: z.string().url("Please enter a valid image URL.").optional(),
  tags: z.array(z.string()).min(1, "Please select at least one tag."),
  published: z.boolean(),
});

type PostFormProps = {
  post?: Post;
};

export function PostForm({ post }: PostFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(
    post?.imageUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTags() {
      const tags = await getTags();
      setAvailableTags(tags);
    }
    fetchTags();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      imageUrl: post?.imageUrl || "",
      tags: post?.tags || [],
      published: post?.published || false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2 MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive",
        });
        e.target.value = ""; // reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const token = getToken();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let res: Response;

      if (post?.id) {
        // Update existing post
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${post.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(values),
          }
        );
      } else {
        // Create new post
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
      }

      if (!res.ok) {
        throw new Error("Failed to save post");
      }

      const savedPost = await res.json();

      toast({
        title: post?.id ? "Post Updated!" : "Post Created!",
        description: `Your post "${savedPost.title}" has been saved successfully.`,
      });

      // Redirect to the post page
      router.push(`/posts/${savedPost.id}`);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = (tagName: string) => {
    const newTag = tagName.trim();
    if (newTag && !availableTags.includes(newTag)) {
      const newTags = [...availableTags, newTag];
      setAvailableTags(newTags);
      // In a real app, you'd also save this new tag to your backend
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The title of your post" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-lg">Featured Image</FormLabel>
              {imagePreview && (
                <div className="relative w-full h-64 rounded-md overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </FormControl>
              <FormDescription>
                Upload an image to accompany your post.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={availableTags.map((tag) => ({
                        value: tag,
                        label: tag,
                      }))}
                      selected={field.value}
                      onChange={field.onChange}
                      onCreate={handleCreateTag}
                      placeholder="Select or create tags..."
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Select existing tags or type to create new ones.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish</FormLabel>
                    <FormDescription>
                      Make this post visible to everyone.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {post ? "Save Changes" : "Publish Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
