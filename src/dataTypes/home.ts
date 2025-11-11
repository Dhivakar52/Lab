
export interface Author {
  name: string;
  avatar: string;
  company: string;
  nominations?: number;
  category: string;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  likes: number;
  comments: number;
  views: number;
  timeAgo: string;
}
