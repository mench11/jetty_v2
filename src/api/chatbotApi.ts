/**
 * Chatbot API Service for communicating with the backend
 */
import { fetchApi, API_ENDPOINTS } from './apiBase';

// Mock data for fallback
const mockChatbots = [
  {
    id: '1',
    name: '一般助手',
    model: 'gpt-3.5-turbo',
    provider: 'openai',
    daily_limit: 50,
    max_tokens: 4000,
    has_file_access: 0,
    system_prompt: '你是一個有用的助手',
    welcome_message: '你好！我是一般助手，有什麼可以幫你的嗎？',
    knowledge_base: null,
    response_language: 'zh-TW',
    temperature: 0.7,
    emoji_mode: 0,
    role: '一般助手',
    principles: '提供有用的信息',
    interaction_examples: null,
    status: 'active'
  },
  {
    id: '2',
    name: '客服機器人',
    model: 'gpt-4',
    provider: 'openai',
    daily_limit: 100,
    max_tokens: 8000,
    has_file_access: 1,
    system_prompt: '你是一個客服機器人',
    welcome_message: '你好！我是客服機器人，有什麼問題我可以幫你解答嗎？',
    knowledge_base: 'customer_service_kb',
    response_language: 'zh-TW',
    temperature: 0.5,
    emoji_mode: 1,
    role: '客服',
    principles: '提供準確的客服信息',
    interaction_examples: '客戶：我的訂單在哪裡？\n機器人：您可以在「我的訂單」頁面查看您的訂單狀態。',
    status: 'active'
  }
];

// Chatbot API with direct connection to backend server
export const chatbotApi = {
  getAll: async () => {
    try {
      // Direct API call to get all chatbots
      return await fetchApi<any[]>(API_ENDPOINTS.CHATBOTS);
    } catch (error) {
      console.error('Error fetching chatbots from API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock chatbots data');
      return mockChatbots;
    }
  },
  
  getById: async (id: string) => {
    try {
      // Direct API call to get a specific chatbot
      return await fetchApi<any>(`${API_ENDPOINTS.CHATBOTS}/${id}`);
    } catch (error) {
      console.error(`Error fetching chatbot ${id} from API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chatbot data for ID: ${id}`);
      const mockChatbot = mockChatbots.find(chatbot => chatbot.id === id);
      if (!mockChatbot) throw new Error('Chatbot not found');
      return mockChatbot;
    }
  },
  
  create: async (chatbotData: any) => {
    try {
      // Direct API call to create a chatbot
      const response = await fetchApi<any>(API_ENDPOINTS.CHATBOTS, {
        method: 'POST',
        body: JSON.stringify(chatbotData),
      });
      
      // If the response doesn't include the full chatbot data, fetch it
      if (!response.id && response.insertId) {
        return await fetchApi<any>(`${API_ENDPOINTS.CHATBOTS}/${response.insertId}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error creating chatbot via API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock chatbot creation');
      const newChatbot = {
        ...chatbotData,
        id: `chatbot-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      };
      mockChatbots.push(newChatbot);
      return newChatbot;
    }
  },
  
  update: async (id: string, chatbotData: any) => {
    try {
      // Direct API call to update a chatbot
      await fetchApi<any>(`${API_ENDPOINTS.CHATBOTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(chatbotData),
      });
      
      // Fetch the updated chatbot to return the complete data
      return await fetchApi<any>(`${API_ENDPOINTS.CHATBOTS}/${id}`);
    } catch (error) {
      console.error(`Error updating chatbot ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chatbot update for ID: ${id}`);
      const index = mockChatbots.findIndex(chatbot => chatbot.id === id);
      if (index === -1) throw new Error('Chatbot not found');
      
      const updatedChatbot = {
        ...mockChatbots[index],
        ...chatbotData,
        id: id, // Ensure ID doesn't change
        updated_at: new Date().toISOString()
      };
      mockChatbots[index] = updatedChatbot;
      return updatedChatbot;
    }
  },
  
  delete: async (id: string) => {
    try {
      // Direct API call to delete a chatbot
      await fetchApi<void>(`${API_ENDPOINTS.CHATBOTS}/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error(`Error deleting chatbot ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock chatbot deletion for ID: ${id}`);
      const index = mockChatbots.findIndex(chatbot => chatbot.id === id);
      if (index === -1) throw new Error('Chatbot not found');
      mockChatbots.splice(index, 1);
      return { success: true };
    }
  },
};
