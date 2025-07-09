export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  balance: number;
  level: number;
  createdAt: Date;
}

export interface Node {
  id: string;
  name: string;
  title: string;
  description?: string;
  avatar?: string;
  header?: string;
  topics: number;
  createdAt: Date;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  userId: string;
  nodeId: string;
  replies: number;
  clicks: number;
  lastReply: Date;
  createdAt: Date;
  user?: User;
  node?: Node;
}

export interface Reply {
  id: string;
  content: string;
  userId: string;
  topicId: string;
  createdAt: Date;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}