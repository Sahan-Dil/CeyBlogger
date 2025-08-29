export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  authorId: string;
  published: boolean;
  createdAt: string;
  tags: string[];
  likes: number;
}
