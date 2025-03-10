/**
 * Base API Service for communicating with the backend
 */

// API base URL - should point to the Express server
const API_BASE_URL = 'http://localhost:3000';

// Generic fetch function with error handling
export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // For DELETE operations that don't return content
    if (response.status === 204) {
      return { success: true } as unknown as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Export common API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  USER_TYPES: '/api/user-types',
  CHATBOTS: '/api/chatbots',
  CHAT_SESSIONS: '/api/chat/sessions',
  CHAT_MESSAGES: '/api/chat/messages',
  API_TOKENS: '/api/tokens'
};
