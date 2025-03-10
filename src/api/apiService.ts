/**
 * API Service for communicating with the backend
 * This file exports all API services and provides backward compatibility
 */

// Import API services from their respective files
import { API_ENDPOINTS } from './apiBase';
import { userApi } from './userApi';
import { userTypeApi } from './userTypeApi';
import { chatbotApi } from './chatbotApi';
import { chatSessionApi } from './chatSessionApi';
import { chatMessageApi } from './chatMessageApi';
import { apiTokenApi } from './apiTokenApi';





// For backward compatibility with existing code
export const apiService = {
  users: userApi,
  chatbots: chatbotApi,
  chatSessions: chatSessionApi,
  chatMessages: chatMessageApi,
  apiTokens: apiTokenApi,
  userTypes: userTypeApi
};

// Re-export all individual API services for direct imports
export {
  userApi,
  userTypeApi,
  chatbotApi,
  chatSessionApi,
  chatMessageApi,
  apiTokenApi,
  API_ENDPOINTS
};

export default apiService;
