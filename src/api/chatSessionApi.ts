/**
 * Chat Session API Service for communicating with the backend
 */
import { fetchApi, API_ENDPOINTS } from './apiBase';

// Mock data for fallback
const mockChatSessions = [
  {
    id: '1',
    user_id: '11111111-1111-1111-1111-111111111111',
    chatbot_id: '1',
    title: '一般對話',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T01:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    user_id: '22222222-2222-2222-2222-222222222222',
    chatbot_id: '2',
    title: '客服問題',
    created_at: '2023-06-02T00:00:00Z',
    updated_at: '2023-06-02T01:00:00Z',
    status: 'active'
  }
];

// Chat Session API with direct connection to backend server
export const chatSessionApi = {
  getAll: async (userId?: string) => {
    try {
      // Direct API call to get all chat sessions, optionally filtered by user ID
      const endpoint = userId 
        ? `${API_ENDPOINTS.CHAT_SESSIONS}?userId=${userId}`
        : API_ENDPOINTS.CHAT_SESSIONS;
      
      return await fetchApi<any[]>(endpoint);
    } catch (error) {
      console.error('Error fetching chat sessions from API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock chat sessions data');
      
      // If userId is provided, filter the mock data
      if (userId) {
        return mockChatSessions.filter(session => session.user_id === userId);
      }
      
      return mockChatSessions;
    }
  },
  
  getById: async (id: string) => {
    try {
      // Direct API call to get a specific chat session
      return await fetchApi<any>(`${API_ENDPOINTS.CHAT_SESSIONS}/${id}`);
    } catch (error) {
      console.error(`Error fetching chat session ${id} from API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chat session data for ID: ${id}`);
      const mockSession = mockChatSessions.find(session => session.id === id);
      if (!mockSession) throw new Error('Chat session not found');
      return mockSession;
    }
  },
  
  create: async (sessionData: any) => {
    try {
      // Direct API call to create a chat session
      const response = await fetchApi<any>(API_ENDPOINTS.CHAT_SESSIONS, {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      
      // If the response doesn't include the full session data, fetch it
      if (!response.id && response.insertId) {
        return await fetchApi<any>(`${API_ENDPOINTS.CHAT_SESSIONS}/${response.insertId}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error creating chat session via API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock chat session creation');
      const newSession = {
        ...sessionData,
        id: `session-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      };
      mockChatSessions.push(newSession);
      return newSession;
    }
  },
  
  update: async (id: string, sessionData: any) => {
    try {
      // Direct API call to update a chat session
      await fetchApi<any>(`${API_ENDPOINTS.CHAT_SESSIONS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });
      
      // Fetch the updated session to return the complete data
      return await fetchApi<any>(`${API_ENDPOINTS.CHAT_SESSIONS}/${id}`);
    } catch (error) {
      console.error(`Error updating chat session ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chat session update for ID: ${id}`);
      const index = mockChatSessions.findIndex(session => session.id === id);
      if (index === -1) throw new Error('Chat session not found');
      
      const updatedSession = {
        ...mockChatSessions[index],
        ...sessionData,
        id: id, // Ensure ID doesn't change
        updated_at: new Date().toISOString()
      };
      mockChatSessions[index] = updatedSession;
      return updatedSession;
    }
  },
  
  delete: async (id: string) => {
    try {
      // Direct API call to delete a chat session
      await fetchApi<void>(`${API_ENDPOINTS.CHAT_SESSIONS}/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error(`Error deleting chat session ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chat session deletion for ID: ${id}`);
      const index = mockChatSessions.findIndex(session => session.id === id);
      if (index === -1) throw new Error('Chat session not found');
      mockChatSessions.splice(index, 1);
      return { success: true };
    }
  },
};
