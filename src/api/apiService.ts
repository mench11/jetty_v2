/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = 'http://localhost:3000';

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// User API
export const userApi = {
  getAll: () => fetchApi<any[]>('/api/users'),
  getById: (id: string) => fetchApi<any>(`/api/users/${id}`),
  create: (userData: any) => fetchApi<any>('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: any) => fetchApi<any>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id: string) => fetchApi<void>(`/api/users/${id}`, {
    method: 'DELETE',
  }),
};

// Chatbot API
export const chatbotApi = {
  getAll: () => fetchApi<any[]>('/api/chatbots'),
  getById: (id: string) => fetchApi<any>(`/api/chatbots/${id}`),
  create: (chatbotData: any) => fetchApi<any>('/api/chatbots', {
    method: 'POST',
    body: JSON.stringify(chatbotData),
  }),
  update: (id: string, chatbotData: any) => fetchApi<any>(`/api/chatbots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(chatbotData),
  }),
  delete: (id: string) => fetchApi<void>(`/api/chatbots/${id}`, {
    method: 'DELETE',
  }),
};

// Chat Session API
export const chatSessionApi = {
  getAll: (userId?: string) => fetchApi<any[]>(userId ? `/api/chat-sessions?userId=${userId}` : '/api/chat-sessions'),
  getById: (id: string) => fetchApi<any>(`/api/chat-sessions/${id}`),
  create: (sessionData: any) => fetchApi<any>('/api/chat-sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),
  update: (id: string, sessionData: any) => fetchApi<any>(`/api/chat-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sessionData),
  }),
  delete: (id: string) => fetchApi<void>(`/api/chat-sessions/${id}`, {
    method: 'DELETE',
  }),
};

// Chat Message API
export const chatMessageApi = {
  getBySessionId: (sessionId: string) => fetchApi<any[]>(`/api/chat-messages?sessionId=${sessionId}`),
  create: (messageData: any) => fetchApi<any>('/api/chat-messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),
};

// API Token API
export const apiTokenApi = {
  getAll: () => fetchApi<any[]>('/api/tokens'),
  getById: (id: string) => fetchApi<any>(`/api/tokens/${id}`),
  create: (tokenData: any) => fetchApi<any>('/api/tokens', {
    method: 'POST',
    body: JSON.stringify(tokenData),
  }),
  update: (id: string, tokenData: any) => fetchApi<any>(`/api/tokens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tokenData),
  }),
  delete: (id: string) => fetchApi<void>(`/api/tokens/${id}`, {
    method: 'DELETE',
  }),
};

// For backward compatibility with existing code
export const apiService = {
  users: userApi,
  chatbots: chatbotApi,
  chatSessions: chatSessionApi,
  chatMessages: chatMessageApi,
  apiTokens: apiTokenApi,
};

export default apiService;
