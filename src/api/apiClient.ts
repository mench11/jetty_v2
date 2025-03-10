// API client for interacting with the backend server
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Generic fetch function with error handling
const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// User API operations
export const userApi = {
  getAll: async () => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/users`);
  },
  
  getById: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/users/${id}`);
  },
  
  create: async (userData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },
  
  update: async (id: string, userData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },
  
  delete: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Chatbot API operations
export const chatbotApi = {
  getAll: async () => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chatbots`);
  },
  
  getById: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chatbots/${id}`);
  },
  
  create: async (chatbotData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chatbots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatbotData)
    });
  },
  
  update: async (id: string, chatbotData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chatbots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatbotData)
    });
  },
  
  delete: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chatbots/${id}`, {
      method: 'DELETE'
    });
  }
};

// Chat session API operations
export const chatSessionApi = {
  getAll: async (userId?: string) => {
    const url = userId 
      ? `${API_BASE_URL}/chat/sessions?userId=${userId}` 
      : `${API_BASE_URL}/chat/sessions`;
    return await fetchWithErrorHandling(url);
  },
  
  getById: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chat/sessions/${id}`);
  },
  
  create: async (sessionData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
  },
  
  update: async (id: string, sessionData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chat/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
  },
  
  delete: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chat/sessions/${id}`, {
      method: 'DELETE'
    });
  }
};

// Chat message API operations
export const chatMessageApi = {
  getBySessionId: async (sessionId: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chat/messages/${sessionId}`);
  },
  
  create: async (messageData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
  }
};

// API token operations
export const apiTokenApi = {
  getAll: async () => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/tokens`);
  },
  
  getById: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/tokens/${id}`);
  },
  
  create: async (tokenData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData)
    });
  },
  
  update: async (id: string, tokenData: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/tokens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData)
    });
  },
  
  delete: async (id: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}/tokens/${id}`, {
      method: 'DELETE'
    });
  }
};

// Test database connection
export const testDatabaseConnection = async () => {
  return await fetchWithErrorHandling(`${API_BASE_URL}/test-db`);
};

export default {
  users: userApi,
  chatbots: chatbotApi,
  chatSessions: chatSessionApi,
  chatMessages: chatMessageApi,
  apiTokens: apiTokenApi,
  testDatabaseConnection
};
