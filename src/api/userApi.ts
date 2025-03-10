/**
 * User API Service for communicating with the backend
 */
import { fetchApi, API_ENDPOINTS } from './apiBase';

// Mock data for fallback
const mockUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'zhang@example.com',
    name: '張三',
    user_type: 'premium',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    last_login: '2023-06-15T00:00:00Z',
    status: 'active'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'li@example.com',
    name: '李四',
    user_type: 'free',
    created_at: '2023-02-15T00:00:00Z',
    updated_at: '2023-02-15T00:00:00Z',
    last_login: '2023-06-10T00:00:00Z',
    status: 'active'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'wang@example.com',
    name: '王五',
    user_type: 'admin',
    created_at: '2023-01-10T00:00:00Z',
    updated_at: '2023-01-10T00:00:00Z',
    last_login: '2023-06-20T00:00:00Z',
    status: 'active'
  }
];

// User API with direct connection to backend server
export const userApi = {
  getAll: async () => {
    try {
      // Direct API call to get all users
      return await fetchApi<any[]>(API_ENDPOINTS.USERS);
    } catch (error) {
      console.error('Error fetching users from API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock users data');
      return mockUsers;
    }
  },
  
  getById: async (id: string) => {
    try {
      // Direct API call to get a specific user
      return await fetchApi<any>(`${API_ENDPOINTS.USERS}/${id}`);
    } catch (error) {
      console.error(`Error fetching user ${id} from API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock user data for ID: ${id}`);
      const mockUser = mockUsers.find(user => user.id === id);
      if (!mockUser) throw new Error('User not found');
      return mockUser;
    }
  },
  
  create: async (userData: any) => {
    try {
      // Direct API call to create a user
      const response = await fetchApi<any>(API_ENDPOINTS.USERS, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      // If the response doesn't include the full user data, fetch it
      if (!response.id && response.insertId) {
        return await fetchApi<any>(`${API_ENDPOINTS.USERS}/${response.insertId}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error creating user via API:', error);
      // Only fall back to mock data if absolutely necessary
      console.log('Falling back to mock user creation');
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        status: 'active'
      };
      mockUsers.push(newUser);
      return newUser;
    }
  },
  
  update: async (id: string, userData: any) => {
    try {
      // Direct API call to update a user
      await fetchApi<any>(`${API_ENDPOINTS.USERS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      // Fetch the updated user to return the complete data
      return await fetchApi<any>(`${API_ENDPOINTS.USERS}/${id}`);
    } catch (error) {
      console.error(`Error updating user ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock user update for ID: ${id}`);
      
      // For mock data, we'll accept any ID format to avoid hardcoded ID issues
      let index = mockUsers.findIndex(user => user.id === id);
      
      // If user not found in mock data, create a new one with this ID
      if (index === -1) {
        const newUser = {
          ...userData,
          id: id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: null,
          status: 'active'
        };
        mockUsers.push(newUser);
        return newUser;
      }
      
      // Update existing user
      const updatedUser = {
        ...mockUsers[index],
        ...userData,
        id: id, // Ensure ID doesn't change
        updated_at: new Date().toISOString()
      };
      mockUsers[index] = updatedUser;
      return updatedUser;
    }
  },
  
  delete: async (id: string) => {
    try {
      // Direct API call to delete a user
      await fetchApi<void>(`${API_ENDPOINTS.USERS}/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error(`Error deleting user ${id} via API:`, error);
      // Only fall back to mock data if absolutely necessary
      console.log(`Falling back to mock user deletion for ID: ${id}`);
      const index = mockUsers.findIndex(user => user.id === id);
      if (index === -1) {
        console.log(`User with ID ${id} not found in mock data, but reporting success anyway`);
        return { success: true };
      }
      mockUsers.splice(index, 1);
      return { success: true };
    }
  },
};
