import { v4 as uuidv4 } from 'uuid';
import { apiTokenApi } from './apiService';

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
  user_id?: string;
  user_name?: string;
  user_email?: string;
}

// For fallback when API fails
const mockTokens: Token[] = [
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
  try {
    const response = await apiTokenApi.getAll();
    // Map API response to Token interface
    return response.map((token: any) => ({
      id: token.id,
      name: token.name,
      value: token.value,
      provider: token.provider,
      createdAt: token.created_at || token.createdAt,
      lastUsed: token.last_used || token.lastUsed,
      usageCount: token.usage_count || token.usageCount || 0,
      isActive: token.status === 'active'
    }));
  } catch (error) {
    console.error('Error fetching tokens from API:', error);
    // Fallback to mock data if API fails
    return [...mockTokens];
  }
};

export const getTokenById = async (id: string): Promise<Token | undefined> => {
  try {
    const token = await apiTokenApi.getById(id);
    if (!token) return undefined;
    
    return {
      id: token.id,
      name: token.name,
      value: token.value,
      provider: token.provider,
      createdAt: token.created_at || token.createdAt,
      lastUsed: token.last_used || token.lastUsed,
      usageCount: token.usage_count || token.usageCount || 0,
      isActive: token.status === 'active'
    };
  } catch (error) {
    console.error(`Error fetching token ${id} from API:`, error);
    // Fallback to mock data if API fails
    return mockTokens.find(token => token.id === id);
  }
};

export const getActiveTokenByProvider = async (provider: 'openai' | 'deepseek' | 'other'): Promise<Token | undefined> => {
  try {
    const tokens = await getTokens();
    return tokens.find(token => token.provider === provider && token.isActive);
  } catch (error) {
    console.error(`Error fetching active token for provider ${provider}:`, error);
    // Fallback to mock data if API fails
    return mockTokens.find(token => token.provider === provider && token.isActive);
  }
};

export const createToken = async (tokenData: Omit<Token, 'id' | 'createdAt' | 'usageCount'>): Promise<Token> => {
  try {
    // Convert to API format
    const apiToken = {
      name: tokenData.name,
      value: tokenData.value,
      provider: tokenData.provider,
      status: tokenData.isActive ? 'active' : 'inactive'
    };
    
    const result = await apiTokenApi.create(apiToken);
    
    // Return the created token with the format expected by the frontend
    return {
      id: result.id || uuidv4(),
      name: tokenData.name,
      value: tokenData.value,
      provider: tokenData.provider,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isActive: tokenData.isActive
    };
  } catch (error) {
    console.error('Error creating token in API:', error);
    // Create a mock token as fallback
    const newToken: Token = {
      id: uuidv4(),
      ...tokenData,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    return newToken;
  }
};

export const updateToken = async (id: string, updates: Partial<Omit<Token, 'id' | 'createdAt'>>): Promise<Token | undefined> => {
  try {
    // First get the current token to merge with updates
    const currentToken = await getTokenById(id);
    if (!currentToken) return undefined;
    
    // Convert to API format
    const apiToken = {
      name: updates.name || currentToken.name,
      value: updates.value || currentToken.value,
      provider: updates.provider || currentToken.provider,
      status: updates.isActive !== undefined ? (updates.isActive ? 'active' : 'inactive') : (currentToken.isActive ? 'active' : 'inactive'),
      usage_count: updates.usageCount || currentToken.usageCount
    };
    
    await apiTokenApi.update(id, apiToken);
    
    // Return the updated token with the format expected by the frontend
    return {
      ...currentToken,
      ...updates
    };
  } catch (error) {
    console.error(`Error updating token ${id} in API:`, error);
    // Return the updated token as if it succeeded (mock behavior)
    const currentToken = await getTokenById(id);
    if (!currentToken) return undefined;
    return { ...currentToken, ...updates };
  }
};

export const deleteToken = async (id: string): Promise<boolean> => {
  try {
    await apiTokenApi.delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting token ${id} from API:`, error);
    return false;
  }
};

export const incrementTokenUsage = async (id: string): Promise<Token | undefined> => {
  try {
    const currentToken = await getTokenById(id);
    if (!currentToken) return undefined;
    
    const updates = {
      lastUsed: new Date().toISOString(),
      usageCount: currentToken.usageCount + 1
    };
    
    return await updateToken(id, updates);
  } catch (error) {
    console.error(`Error incrementing usage for token ${id}:`, error);
    // Return the token with incremented usage (mock behavior)
    const currentToken = await getTokenById(id);
    if (!currentToken) return undefined;
    
    return {
      ...currentToken,
      lastUsed: new Date().toISOString(),
      usageCount: currentToken.usageCount + 1
    };
  }
};

// Token validation
export const validateToken = async (token: string, provider: 'openai' | 'deepseek' | 'other'): Promise<boolean> => {
  try {
    // Make a real API call to validate the token
    if (provider === 'openai') {
      // For OpenAI, we can make a simple models list request to check if the token is valid
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.status === 200;
    } 
    else if (provider === 'deepseek') {
      // For DeepSeek, we would make a similar validation call
      // This is a placeholder - replace with actual DeepSeek API validation
      const response = await fetch('https://api.deepseek.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.status === 200;
    }
    
    // For other providers, we'll just check the format
    return token.length > 20;
  } catch (error) {
    console.error(`Error validating ${provider} token:`, error);
    
    // Fallback to basic format validation
    if (provider === 'openai') {
      return token.startsWith('sk-') && token.length > 10;
    } else if (provider === 'deepseek') {
      return token.startsWith('dsk-') && token.length > 10;
    } else {
      return token.length > 10;
    }
  }
};