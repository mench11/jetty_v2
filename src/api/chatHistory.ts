import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Chat history types
export interface ChatHistoryEntry {
  id: string;
  userId: string;
  chatbotId: string;
  sessionId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  metadata: {
    model: string;
    provider: 'openai' | 'deepseek' | 'other';
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    startTime: string;
    endTime: string;
    title: string;
  };
  tags?: string[];
}

// Mock storage for chat history (in a real app, this would be in a database)
let chatHistory: ChatHistoryEntry[] = [
  {
    id: '1',
    userId: 'user-123',
    chatbotId: 'chatbot-1',
    sessionId: 'session-1',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: '你好，請問什麼是光合作用？',
        timestamp: '2023-06-01T10:30:00Z'
      },
      {
        id: 'm2',
        role: 'assistant',
        content: '光合作用是植物、藻類和某些細菌利用光能將二氧化碳和水轉化為葡萄糖和氧氣的過程。這個過程主要發生在植物的葉綠體中，是地球上大部分生命能量的來源。',
        timestamp: '2023-06-01T10:30:05Z'
      }
    ],
    metadata: {
      model: 'gpt-4',
      provider: 'openai',
      tokenUsage: {
        prompt: 15,
        completion: 120,
        total: 135
      },
      startTime: '2023-06-01T10:30:00Z',
      endTime: '2023-06-01T10:30:05Z',
      title: '關於光合作用的問題'
    },
    tags: ['科學', '生物']
  },
  {
    id: '2',
    userId: 'user-123',
    chatbotId: 'chatbot-2',
    sessionId: 'session-2',
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: '如何解二次方程式？',
        timestamp: '2023-06-02T14:20:00Z'
      },
      {
        id: 'm4',
        role: 'assistant',
        content: '解二次方程式 ax² + bx + c = 0 的標準方法是使用公式：x = (-b ± √(b² - 4ac)) / 2a。這裡的 ± 表示有兩個可能的解，一個使用加號，一個使用減號。',
        timestamp: '2023-06-02T14:20:07Z'
      }
    ],
    metadata: {
      model: 'deepseek-chat',
      provider: 'deepseek',
      tokenUsage: {
        prompt: 10,
        completion: 90,
        total: 100
      },
      startTime: '2023-06-02T14:20:00Z',
      endTime: '2023-06-02T14:20:07Z',
      title: '二次方程式求解'
    },
    tags: ['數學', '代數']
  }
];

// Chat history management functions
export const getChatHistory = async (userId: string): Promise<ChatHistoryEntry[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return chatHistory.filter(entry => entry.userId === userId);
};

export const getChatHistoryBySession = async (sessionId: string): Promise<ChatHistoryEntry | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return chatHistory.find(entry => entry.sessionId === sessionId);
};

export const createChatHistoryEntry = async (
  userId: string,
  chatbotId: string,
  initialMessage: string,
  model: string,
  provider: 'openai' | 'deepseek' | 'other'
): Promise<ChatHistoryEntry> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const now = new Date().toISOString();
  const sessionId = uuidv4();
  
  const newEntry: ChatHistoryEntry = {
    id: uuidv4(),
    userId,
    chatbotId,
    sessionId,
    messages: [
      {
        id: uuidv4(),
        role: 'user',
        content: initialMessage,
        timestamp: now
      }
    ],
    metadata: {
      model,
      provider,
      startTime: now,
      endTime: now,
      title: generateTitle(initialMessage)
    }
  };
  
  chatHistory.push(newEntry);
  return newEntry;
};

export const addMessageToChatHistory = async (
  sessionId: string,
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  },
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  }
): Promise<ChatHistoryEntry | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = chatHistory.findIndex(entry => entry.sessionId === sessionId);
  if (index === -1) return undefined;
  
  const now = new Date().toISOString();
  
  const newMessage = {
    id: uuidv4(),
    ...message,
    timestamp: now
  };
  
  chatHistory[index] = {
    ...chatHistory[index],
    messages: [...chatHistory[index].messages, newMessage],
    metadata: {
      ...chatHistory[index].metadata,
      endTime: now,
      tokenUsage: tokenUsage || chatHistory[index].metadata.tokenUsage
    }
  };
  
  return chatHistory[index];
};

export const updateChatHistoryMetadata = async (
  sessionId: string,
  updates: Partial<ChatHistoryEntry['metadata']>
): Promise<ChatHistoryEntry | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = chatHistory.findIndex(entry => entry.sessionId === sessionId);
  if (index === -1) return undefined;
  
  chatHistory[index] = {
    ...chatHistory[index],
    metadata: {
      ...chatHistory[index].metadata,
      ...updates
    }
  };
  
  return chatHistory[index];
};

export const deleteChatHistory = async (sessionId: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const initialLength = chatHistory.length;
  chatHistory = chatHistory.filter(entry => entry.sessionId !== sessionId);
  return chatHistory.length < initialLength;
};

export const addTagsToChatHistory = async (
  sessionId: string,
  tags: string[]
): Promise<ChatHistoryEntry | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = chatHistory.findIndex(entry => entry.sessionId === sessionId);
  if (index === -1) return undefined;
  
  const currentTags = chatHistory[index].tags || [];
  const uniqueTags = [...new Set([...currentTags, ...tags])];
  
  chatHistory[index] = {
    ...chatHistory[index],
    tags: uniqueTags
  };
  
  return chatHistory[index];
};

// Helper function to generate a title from the initial message
const generateTitle = (message: string): string => {
  // Truncate the message if it's too long
  const maxLength = 30;
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

// Export a function to format chat history for display
export const formatChatHistoryForDisplay = (history: ChatHistoryEntry[]): Array<{
  id: string;
  title: string;
  date: string;
  model: string;
  messageCount: number;
  preview: string;
}> => {
  return history.map(entry => ({
    id: entry.sessionId,
    title: entry.metadata.title,
    date: format(new Date(entry.metadata.startTime), 'yyyy-MM-dd HH:mm'),
    model: entry.metadata.model,
    messageCount: entry.messages.length,
    preview: entry.messages[0].content.substring(0, 50) + (entry.messages[0].content.length > 50 ? '...' : '')
  }));
};