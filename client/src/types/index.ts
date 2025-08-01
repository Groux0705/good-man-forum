export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  balance: number;
  level: number;
  experience?: number;
  status?: string;
  createdAt: string;
  punishments?: UserPunishment[];
}

export interface UserPunishment {
  id: string;
  type: string;
  reason: string;
  severity: number;
  startTime: string;
  endTime?: string;
  details?: string;
  status?: 'active' | 'expired' | 'revoked';
  createdAt: string;
}

export interface LevelInfo {
  title: string;
  badge: string;
  privileges: string[];
  progress: number;
  nextLevelExp: number | null;
  currentLevelExp: number;
}

export interface PointHistory {
  id: string;
  amount: number;
  type: string;
  reason: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}

export interface Node {
  id: string;
  name: string;
  title: string;
  description?: string;
  avatar?: string;
  header?: string;
  topics: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  userId: string;
  nodeId: string;
  replies: number;
  clicks: number;
  likes: number;
  favorites: number;
  lastReply: string;
  createdAt: string;
  user?: User;
  node?: Node;
  replyList?: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  userId: string;
  topicId: string;
  parentId?: string;
  replyToUsername?: string;
  createdAt: string;
  user?: User;
  parent?: Reply;
  children?: Reply[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  user: User;
  token: string;
}