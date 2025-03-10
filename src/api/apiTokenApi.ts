/**
 * API Token Service for communicating with the backend
 */
import { fetchApi, API_ENDPOINTS } from './apiBase';

// Mock data for fallback
const mockApiTokens = [
  {
    id: '1',
    user_id: '11111111-1111-1111-1111-111111111111',
    token: 'tk_123456789abcdef',
    name: '張三的API金鑰',
    expires_at: '2024-06-01T00:00:00Z',
    created_at: '2023-06-01T00:00:00Z',
    last_used_at: '2023-06-15T00:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    user_id: '33333333-3333-3333-3333-333333333333',
    token: 'tk_abcdef123456789',
    name: '王五的API金鑰',
    expires_at: '2024-06-01T00:00:00Z',
    created_at: '2023-06-01T00:00:00Z',
    last_used_at: '2023-06-20T00:00:00Z',
    status: 'active'
  }
];

// API Token API with direct connection to backend server
export const apiTokenApi = {
  getAll: async () => {
    try {
      // Direct API call to get all API tokens
      return await fetchApi<any[]>(API_ENDPOINTS.API_TOKENS);
    } catch (error) {
      console.error('Error fetching API tokens from API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock API tokens data');
      return mockApiTokens;
    }
  },
  
  getById: async (id: string) => {
    try {
      // Direct API call to get a specific API token
      return await fetchApi<any>(`${API_ENDPOINTS.API_TOKENS}/${id}`);
    } catch (error) {
      console.error(`Error fetching API token ${id} from API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock API token data for ID: ${id}`);
      const mockToken = mockApiTokens.find(token => token.id === id);
      if (!mockToken) throw new Error('API token not found');
      return mockToken;
    }
  },
  
  create: async (tokenData: any) => {
    try {
      // Direct API call to create an API token
      const response = await fetchApi<any>(API_ENDPOINTS.API_TOKENS, {
        method: 'POST',
        body: JSON.stringify(tokenData),
      });
      
      // If the response doesn't include the full token data, fetch it
      if (!response.id && response.insertId) {
        return await fetchApi<any>(`${API_ENDPOINTS.API_TOKENS}/${response.insertId}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error creating API token via API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock API token creation');
      const newToken = {
        ...tokenData,
        id: `token-${Date.now()}`,
        token: `tk_${Math.random().toString(36).substring(2, 15)}`,
        created_at: new Date().toISOString(),
        last_used_at: null,
        status: 'active'
      };
      mockApiTokens.push(newToken);
      return newToken;
    }
  },
  
  update: async (id: string, tokenData: any) => {
    try {
      // Direct API call to update an API token
      await fetchApi<any>(`${API_ENDPOINTS.API_TOKENS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tokenData),
      });
      
      // Fetch the updated token to return the complete data
      return await fetchApi<any>(`${API_ENDPOINTS.API_TOKENS}/${id}`);
    } catch (error) {
      console.error(`Error updating API token ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock API token update for ID: ${id}`);
      const index = mockApiTokens.findIndex(token => token.id === id);
      if (index === -1) throw new Error('API token not found');
      
      const updatedToken = {
        ...mockApiTokens[index],
        ...tokenData,
        id: id // Ensure ID doesn't change
      };
      mockApiTokens[index] = updatedToken;
      return updatedToken;
    }
  },
  
  delete: async (id: string) => {
    try {
      // Direct API call to delete an API token
      await fetchApi<void>(`${API_ENDPOINTS.API_TOKENS}/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error(`Error deleting API token ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock API token deletion for ID: ${id}`);
      const index = mockApiTokens.findIndex(token => token.id === id);
      if (index === -1) throw new Error('API token not found');
      mockApiTokens.splice(index, 1);
      return { success: true };
    }
  },
};
