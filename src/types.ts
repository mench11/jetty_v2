export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    subject: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  };
  accessRights?: UserAccessRights;
}

export interface UserAccessRights {
  chatbots: ChatbotAccess[];
  accessExpiry: string;
  userType: 'free' | 'premium' | 'admin';
}

export interface ChatbotAccess {
  id: string;
  name: string;
  model: string;
  dailyLimit: number;
  maxTokens: number;
  hasFileAccess: boolean;
  systemPrompt: string;
}

export interface ChatbotConfig extends ChatbotAccess {
  knowledgeBase: string | null;
  responseLanguage: 'zh-HK' | 'en' | 'zh-CN' | 'zh-TW';
  temperature: number;
  emojiMode: boolean;
  role: string;
  principles: string;
  interactionExamples: string;
  knowledgeBaseEnabled: boolean;
  welcomeMessage?: string;
  provider?: 'openai' | 'deepseek' | 'other';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  chatbotId?: string;
}

export interface ChatSession {
  id: string;
  chatbotId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  content: string;
  feedback?: string;
  score?: number;
  submittedAt?: number;
  evaluatedAt?: number;
}

export interface LearningMaterial {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'exercise' | 'reading' | 'quiz';
  subject: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  summary?: string;
  keyPoints?: string[];
  reviewQuestions?: string[];
}

export interface LanguagePractice {
  id: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  conversation: ChatMessage[];
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

// Dashboard types
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  userType: 'free' | 'premium' | 'admin';
  createdAt: number;
  lastActive: number;
  chatbotsAccess: string[]; // IDs of accessible chatbots
}

export interface ChatbotUsageStats {
  totalSessions: number;
  totalMessages: number;
  averageMessagesPerSession: number;
  activeUsers: number;
  popularTopics: Array<{topic: string, count: number}>;
}

// Token management types
export interface ApiToken {
  id: string;
  name: string;
  value: string;
  provider: 'openai' | 'deepseek' | 'other';
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  isActive: boolean;
}

// Chat history types
export interface ChatHistoryRecord {
  id: string;
  sessionId: string;
  userId: string;
  chatbotId: string;
  title: string;
  startTime: string;
  endTime: string;
  messages: ChatMessage[];
  model: string;
  provider: 'openai' | 'deepseek' | 'other';
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  tags?: string[];
}