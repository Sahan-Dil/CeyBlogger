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

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface FilterOptions {
  authors: Author[];
  tags: string[];
}
