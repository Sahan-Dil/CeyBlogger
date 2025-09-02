"use client";

import { useEffect, useState } from "react";
import type { Post, User } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { getUser } from "@/lib/data";
import { format } from "date-fns";
import { ApiError } from "@/lib/api";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    const fetchAuthor = async () => {
      try {
        const user = await getUser(post.authorId);
        if (active) setAuthor(user!);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          console.warn("Token expired or unauthorized. Ignoring author fetch.");
        } else {
          console.error("Failed to load author", err);
        }
        if (active) setAuthor(null);
      }
    };

    fetchAuthor();

    return () => {
      active = false;
    };
  }, [post.authorId]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/posts/${post.id}`} className="block">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint="blog image"
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-6 flex-1">
        <div className="flex gap-2 mb-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/posts/${post.id}`}>
          <CardTitle className="text-xl font-bold leading-snug hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </Link>
        <p
          className="mt-3 text-muted-foreground line-clamp-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {author && (
            <Link
              href={`/profile/${author.id}`}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.avatarUrl} alt={author.name} />
                <AvatarFallback>
                  {author.name ? author.name.charAt(0) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold group-hover:text-primary">
                  {author.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </Link>
          )}
        </div>
        <Link
          href={`/posts/${post.id}`}
          className="text-primary hover:underline flex items-center gap-1 text-sm"
        >
          Read More <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
