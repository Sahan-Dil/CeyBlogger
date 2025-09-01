import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/blog/PostCard";
import { getPosts } from "@/lib/data";
import { ArrowRight, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function Home() {
  const posts = await getPosts();
  const publishedPosts = posts.filter((p) => p.published);
  const featuredPost = publishedPosts[0];
  const recentPosts = publishedPosts.slice(1);

  return (
    <div className="w-full">
      {/* Hero Section */}
      {featuredPost && (
        <section className="relative w-full h-[60vh] bg-primary/20">
          <div className="container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold max-w-3xl text-primary-foreground mix-blend-difference">
              {featuredPost.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/80 mix-blend-difference">
              A deep dive into the latest trends and technologies shaping our
              world.
            </p>
            <Link href={`/posts/${featuredPost.id}`} className="mt-8">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Read Article <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-12 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search posts by title or content..."
              className="pl-10"
            />
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="author1">John Doe</SelectItem>
                <SelectItem value="author2">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="life">Lifestyle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recent Posts */}
        <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline">Load More Posts</Button>
        </div>
      </div>
    </div>
  );
}
