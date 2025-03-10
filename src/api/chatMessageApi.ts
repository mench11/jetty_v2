/**
 * Chat Message API Service for communicating with the backend
 */
import { fetchApi, API_ENDPOINTS } from './apiBase';

// Mock data for fallback
const mockChatMessages = [
  {
    id: '1',
    session_id: '1',
    role: 'user',
    content: '你好，我需要一些幫助',
    created_at: '2023-06-01T00:10:00Z'
  },
  {
    id: '2',
    session_id: '1',
    role: 'assistant',
    content: '你好！我是一般助手，有什麼可以幫你的嗎？',
    created_at: '2023-06-01T00:10:05Z'
  },
  {
    id: '3',
    session_id: '2',
    role: 'user',
    content: '我的訂單在哪裡？',
    created_at: '2023-06-02T00:15:00Z'
  },
  {
    id: '4',
    session_id: '2',
    role: 'assistant',
    content: '您可以在「我的訂單」頁面查看您的訂單狀態。',
    created_at: '2023-06-02T00:15:05Z'
  }
];

// Chat Message API with direct connection to backend server
export const chatMessageApi = {
  getBySessionId: async (sessionId: string) => {
    try {
      // Direct API call to get all messages for a specific session
      return await fetchApi<any[]>(`${API_ENDPOINTS.CHAT_MESSAGES}?sessionId=${sessionId}`);
    } catch (error) {
      console.error(`Error fetching chat messages for session ${sessionId} from API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chat messages data for session ID: ${sessionId}`);
      return mockChatMessages.filter(message => message.session_id === sessionId);
    }
  },
  
  create: async (messageData: any) => {
    try {
      // Direct API call to create a chat message
      const response = await fetchApi<any>(API_ENDPOINTS.CHAT_MESSAGES, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
      
      // If the response doesn't include the full message data, fetch it
      if (!response.id && response.insertId) {
        return await fetchApi<any>(`${API_ENDPOINTS.CHAT_MESSAGES}/${response.insertId}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error creating chat message via API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock chat message creation');
      const newMessage = {
        ...messageData,
        id: `message-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      mockChatMessages.push(newMessage);
      return newMessage;
    }
  },
  
  update: async (id: string, messageData: any) => {
    try {
      // Direct API call to update a chat message
      await fetchApi<any>(`${API_ENDPOINTS.CHAT_MESSAGES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(messageData),
      });
      
      // Fetch the updated message to return the complete data
      return await fetchApi<any>(`${API_ENDPOINTS.CHAT_MESSAGES}/${id}`);
    } catch (error) {
      console.error(`Error updating chat message ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chat message update for ID: ${id}`);
      const index = mockChatMessages.findIndex(message => message.id === id);
      if (index === -1) throw new Error('Chat message not found');
      
      const updatedMessage = {
        ...mockChatMessages[index],
        ...messageData,
        id: id // Ensure ID doesn't change
      };
      mockChatMessages[index] = updatedMessage;
      return updatedMessage;
    }
  },
  
  delete: async (id: string) => {
    try {
      // Direct API call to delete a chat message
      await fetchApi<void>(`${API_ENDPOINTS.CHAT_MESSAGES}/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error(`Error deleting chat message ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chat message deletion for ID: ${id}`);
      const index = mockChatMessages.findIndex(message => message.id === id);
      if (index === -1) throw new Error('Chat message not found');
      mockChatMessages.splice(index, 1);
      return { success: true };
    }
  },
};
