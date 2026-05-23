/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "intern" | "mentor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  badges: string[];
  points: number;
  spurthiPoints: number; // S: Spurthi Points representing active contributions & codebase replies
  department: string;
  joinedAt: string;
}

export interface Answer {
  id: string;
  queryId: string;
  content: string;
  author: User;
  isMentorVerified: boolean;
  isAiGenerated: boolean;
  createdAt: string;
  upvotes: string[]; // List of user IDs
}

export interface Query {
  id: string;
  title: string;
  description: string;
  status: "open" | "assigned" | "resolved" | "closed";
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  author: User;
  assignedMentor?: User;
  createdAt: string;
  resolvedAt?: string;
  answers: Answer[];
  upvotes: string[]; // List of user IDs
  views: number;
  aiSummary?: string;
  duplicateOfId?: string; // Links to another Query or FAQ
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  views: number;
  helpfulCount: number;
  unhelpfulCount: number;
  sourceQueryId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: "query_solved" | "new_answer" | "assigned" | "system";
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "model";
  text: string;
  createdAt: string;
  citations?: string[];
  confidence?: number;
}

export interface SystemPromptConfig {
  id: string;
  systemInstruction: string;
  temperature: number;
  model: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface AnalyticsSummary {
  totalQueries: number;
  resolvedQueries: number;
  unresolvedQueries: number;
  totalFAQs: number;
  averageResolutionTimeHours: number;
  tagCloud: { text: string; value: number }[];
  heatmap: { day: string; hours: { hour: number; count: number }[] }[];
  leaderboard: { user: User; count: number }[];
  tokenUsageCount: number; // Cumulative AI token consumption
  serverCpuPercent: number; // Server processing load
  serverMemoryMb: number; // Server heap allocation
}
