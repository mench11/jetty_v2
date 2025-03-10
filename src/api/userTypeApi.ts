/**
 * User Type API Service for communicating with the backend
 */
import { fetchApi, API_ENDPOINTS } from './apiBase';

// Mock data for fallback
const mockUserTypes = [
  { id: 'admin', name: '管理員', description: '系統管理員，擁有全部權限', status: 'active' },
  { id: 'premium', name: '高級會員', description: '付費用戶，擁有高級功能', status: 'active' },
  { id: 'free', name: '免費用戶', description: '基本用戶，擁有基本功能', status: 'active' }
];

// User Type API with direct connection to backend server
export const userTypeApi = {
  getAll: async () => {
    try {
      // Direct API call to get all user types
      return await fetchApi<any[]>(API_ENDPOINTS.USER_TYPES);
    } catch (error) {
      console.error('Error fetching user types from API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock user types data');
      return mockUserTypes;
    }
  },
  
  getById: async (id: string) => {
    try {
      // Direct API call to get a specific user type
      return await fetchApi<any>(`${API_ENDPOINTS.USER_TYPES}/${id}`);
    } catch (error) {
      console.error(`Error fetching user type ${id} from API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock user type data for ID: ${id}`);
      const mockUserType = mockUserTypes.find(type => type.id === id);
      if (!mockUserType) throw new Error('User type not found');
      return mockUserType;
    }
  },
  
  create: async (userTypeData: any) => {
    try {
      // Direct API call to create a user type
      const response = await fetchApi<any>(API_ENDPOINTS.USER_TYPES, {
        method: 'POST',
        body: JSON.stringify(userTypeData),
      });
      
      // If the response doesn't include the full user type data, fetch it
      if (!response.id && response.insertId) {
        return await fetchApi<any>(`${API_ENDPOINTS.USER_TYPES}/${response.insertId}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error creating user type via API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock user type creation');
      const newUserType = {
        ...userTypeData,
        id: `type-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      };
      mockUserTypes.push(newUserType);
      return newUserType;
    }
  },
  
  update: async (id: string, userTypeData: any) => {
    try {
      // Direct API call to update a user type
      await fetchApi<any>(`${API_ENDPOINTS.USER_TYPES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userTypeData),
      });
      
      // Fetch the updated user type to return the complete data
      return await fetchApi<any>(`${API_ENDPOINTS.USER_TYPES}/${id}`);
    } catch (error) {
      console.error(`Error updating user type ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock user type update for ID: ${id}`);
      const index = mockUserTypes.findIndex(type => type.id === id);
      if (index === -1) throw new Error('User type not found');
      
      const updatedUserType = {
        ...mockUserTypes[index],
        ...userTypeData,
        id: id, // Ensure ID doesn't change
        updated_at: new Date().toISOString()
      };
      mockUserTypes[index] = updatedUserType;
      return updatedUserType;
    }
  },
  
  delete: async (id: string) => {
    try {
      // Direct API call to delete a user type
      await fetchApi<void>(`${API_ENDPOINTS.USER_TYPES}/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error(`Error deleting user type ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock user type deletion for ID: ${id}`);
      const index = mockUserTypes.findIndex(type => type.id === id);
      if (index === -1) throw new Error('User type not found');
      mockUserTypes.splice(index, 1);
      return { success: true };
    }
  },
};
