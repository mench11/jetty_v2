import { v4 as uuidv4 } from 'uuid';

// Token types
export interface Token {
  id: string;
  name: string;
  value: string;
  provider: 'openai' | 'deepseek' | 'other';
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  isActive: boolean;
}

// Mock storage for tokens (in a real app, this would be in a database)
let tokens: Token[] = [
  {
    id: '1',
    name: 'OpenAI Production',
    value: 'sk-xxxx-xxxx-xxxx',
    provider: 'openai',
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 42,
    isActive: true
  },
  {
    id: '2',
    name: 'DeepSeek Testing',
    value: 'dsk-xxxx-xxxx-xxxx',
    provider: 'deepseek',
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 15,
    isActive: true
  }
];

// Token management functions
export const getTokens = async (): Promise<Token[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...tokens];
};

export const getTokenById = async (id: string): Promise<Token | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return tokens.find(token => token.id === id);
};

export const getActiveTokenByProvider = async (provider: 'openai' | 'deepseek' | 'other'): Promise<Token | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return tokens.find(token => token.provider === provider && token.isActive);
};

export const createToken = async (tokenData: Omit<Token, 'id' | 'createdAt' | 'usageCount'>): Promise<Token> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newToken: Token = {
    id: uuidv4(),
    ...tokenData,
    createdAt: new Date().toISOString(),
    usageCount: 0
  };
  
  tokens.push(newToken);
  return newToken;
};

export const updateToken = async (id: string, updates: Partial<Omit<Token, 'id' | 'createdAt'>>): Promise<Token | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = tokens.findIndex(token => token.id === id);
  if (index === -1) return undefined;
  
  tokens[index] = { ...tokens[index], ...updates };
  return tokens[index];
};

export const deleteToken = async (id: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const initialLength = tokens.length;
  tokens = tokens.filter(token => token.id !== id);
  return tokens.length < initialLength;
};

export const incrementTokenUsage = async (id: string): Promise<Token | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const index = tokens.findIndex(token => token.id === id);
  if (index === -1) return undefined;
  
  tokens[index] = {
    ...tokens[index],
    usageCount: tokens[index].usageCount + 1,
    lastUsed: new Date().toISOString()
  };
  
  return tokens[index];
};

// Token validation
export const validateToken = async (token: string, provider: 'openai' | 'deepseek' | 'other'): Promise<boolean> => {
  // In a real app, this would make an API call to validate the token
  // For demo purposes, we'll just check if it has the expected format
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  if (provider === 'openai') {
    return token.startsWith('sk-') && token.length > 10;
  } else if (provider === 'deepseek') {
    return token.startsWith('dsk-') && token.length > 10;
  } else {
    return token.length > 10;
  }
};