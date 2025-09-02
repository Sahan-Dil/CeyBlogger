import { API_URL, ApiError, get } from "./api";
import type { Post, User, Comment } from "./types";

const users: User[] = [
  {
    id: "68b32bff282fc0381139fa6f",
    name: "Aria Montgomery",
    email: "aria.m@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=user-1",
    bio: "A passionate storyteller and design enthusiast, Aria brings a unique perspective to the world of tech and creativity. Follow her journey as she explores the intersection of art and innovation.",
  },
  {
    id: "user-2",
    name: "Ezra Fitz",
    email: "ezra.f@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=user-2",
    bio: "With a background in literature and a keen eye for emerging technologies, Ezra breaks down complex topics into engaging and accessible content. He believes in the power of words to inspire change.",
  },
];

const posts: Post[] = [
  {
    id: "post-1",
    title: "The Renaissance of Digital Art",
    content:
      "The digital art scene is experiencing a profound transformation, driven by blockchain technology and the rise of NFTs. This article explores the history of digital art, from early computer-generated works to the vibrant, decentralized marketplaces of today. We'll delve into how artists are leveraging this new paradigm to gain ownership and reach a global audience, and what it means for the future of creativity and collection. We also look at the environmental concerns and the ongoing debate within the art community.",
    imageUrl: "https://picsum.photos/1200/800?random=1",
    authorId: "user-1",
    published: true,
    createdAt: "2024-05-15T08:00:00Z",
    tags: ["Design", "Technology", "Art"],
    likes: 138,
  },
  {
    id: "post-2",
    title: "Crafting the Perfect User Experience",
    content:
      "User experience (UX) is more than just a buzzword; it's the cornerstone of successful product design. This guide provides a step-by-step walkthrough of the UX design process, from user research and persona creation to wireframing, prototyping, and usability testing. Learn how to empathize with your users, identify their pain points, and design intuitive, enjoyable interfaces that keep them coming back. We include case studies from top companies to illustrate these principles in action.",
    imageUrl: "https://picsum.photos/1200/800?random=2",
    authorId: "user-2",
    published: true,
    createdAt: "2024-05-12T14:30:00Z",
    tags: ["Design", "UX", "Productivity"],
    likes: 256,
  },
  {
    id: "post-3",
    title: "A Minimalist's Guide to a Clutter-Free Digital Life",
    content:
      "In a world of constant notifications and digital noise, finding focus can be a challenge. This article offers practical tips for decluttering your digital life. From managing your email inbox and organizing your files to curating your social media feeds, we cover simple yet effective strategies to create a more serene and productive digital environment. Embrace digital minimalism and reclaim your time and attention.",
    imageUrl: "https://picsum.photos/1200/800?random=3",
    authorId: "user-1",
    published: true,
    createdAt: "2024-05-10T11:00:00Z",
    tags: ["Lifestyle", "Productivity"],
    likes: 305,
  },
  {
    id: "post-4",
    title: "The Future of Sustainable Technology",
    content:
      "As our reliance on technology grows, so does its environmental impact. This piece examines the latest innovations in sustainable tech, from green data centers and circular economy electronics to AI-powered solutions for climate change. We discuss the challenges and opportunities for the tech industry to lead the way in creating a more sustainable future. This is a must-read for anyone interested in the intersection of technology and environmentalism.",
    imageUrl: "https://picsum.photos/1200/800?random=4",
    authorId: "user-2",
    published: true,
    createdAt: "2024-05-08T09:20:00Z",
    tags: ["Technology", "Sustainability"],
    likes: 192,
  },
  {
    id: "post-5",
    title: "Exploring the World of 3D Printing",
    content:
      "3D printing is revolutionizing industries from healthcare to manufacturing. This post provides an overview of the different types of 3D printing technologies, their applications, and what the future holds. We also include a beginner's guide to getting started with your own 3D printing projects.",
    imageUrl: "https://picsum.photos/1200/800?random=5",
    authorId: "user-1",
    published: false,
    createdAt: "2024-05-20T10:00:00Z",
    tags: ["Technology", "DIY", "Innovation"],
    likes: 42,
  },
];

const comments: Comment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    authorId: "user-2",
    content:
      "Incredible insights on the digital art revolution. It really feels like we are on the cusp of a new era for creators.",
    createdAt: "2024-05-15T10:30:00Z",
  },
  {
    id: "comment-2",
    postId: "post-1",
    authorId: "user-1",
    content:
      "Thank you! I'm glad you enjoyed it. The potential for artists is immense.",
    createdAt: "2024-05-15T11:00:00Z",
  },
  {
    id: "comment-3",
    postId: "post-2",
    authorId: "user-1",
    content:
      "This is a fantastic and comprehensive guide to UX. Bookmarking this for my students!",
    createdAt: "2024-05-13T09:00:00Z",
  },
];

const allTags: string[] = [
  "Design",
  "Technology",
  "Art",
  "UX",
  "Productivity",
  "Lifestyle",
  "Sustainability",
  "DIY",
  "Innovation",
];

// Simulate API calls

export async function getPosts(limit = 9, cursor?: string) {
  try {
    const url = new URL("/posts", process.env.NEXT_PUBLIC_API_URL!); // Make sure this env is set
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("published", "true");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      cache: "no-store", // always fresh data
    });

    if (!res.ok) {
      console.error("Fetch failed:", res.status, await res.text());
      throw new Error("Failed to fetch posts");
    }

    const data: { posts: Post[]; nextCursor: string | null } = await res.json();
    return data;
  } catch (err) {
    console.error("getPosts error:", err);
    throw err;
  }
}

export const getPost = async (id: string): Promise<Post | undefined> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(posts.find((p) => p.id === id)), 50)
  );
};

export const getUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(users), 50));
};

export const getUser = async (id: string): Promise<User | undefined> => {
  try {
    if (!id) return undefined;
    const user = await get<User>(`/users/${id}`);
    return user;
  } catch (err) {
    // Only log unexpected errors, ignore 401 (unauthorized)
    if (err instanceof ApiError) {
      if (err.status === 401) {
        // Token expired or unauthorized: silently ignore
        return undefined;
      } else {
        console.error(
          "API Error - Status:",
          err.status,
          "Message:",
          err.message
        );
      }
    } else {
      console.error("Network/Connection Error:", err);
    }
    return undefined;
  }
};

export const updateUser = async (user: User): Promise<User | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(user), 50));
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(comments.filter((c) => c.postId === postId)), 50)
  );
};

export const getTags = async (): Promise<string[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(allTags), 50));
};
