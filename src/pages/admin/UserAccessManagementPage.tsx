import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { chatbotApi, userApi } from '../../api/apiService';

const UserAccessManagementPage: React.FC = () => {
  const { user } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Mock users for demonstration
  const mockUsers = [
    {
      id: 'user-1',
      name: '張三',
      email: 'zhang@example.com',
      user_type: 'premium',
      access_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: '2023-01-01T00:00:00Z',
      last_active: '2023-06-15T00:00:00Z',
      chatbots_access: ['chatbot-1', 'chatbot-2']
    },
    {
      id: 'user-2',
      name: '李四',
      email: 'li@example.com',
      user_type: 'free',
      access_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: '2023-02-15T00:00:00Z',
      last_active: '2023-06-10T00:00:00Z',
      chatbots_access: ['chatbot-1']
    },
    {
      id: 'user-3',
      name: '王五',
      email: 'wang@example.com',
      user_type: 'admin',
      access_expiry: null,
      created_at: '2023-01-10T00:00:00Z',
      last_active: '2023-06-20T00:00:00Z',
      chatbots_access: ['chatbot-1', 'chatbot-2']
    }
  ];

  useEffect(() => {
    // Check if user is admin
    if (!user || user.accessRights?.userType !== 'admin') {
      window.location.href = '/';
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch chatbots
        const chatbotsData = await chatbotApi.getAll();
        setChatbots(chatbotsData);
        
        // Fetch users from the API
        try {
          const usersData = await userApi.getAll();
          setUsers(usersData.length > 0 ? usersData : mockUsers); // Fallback to mock data if API returns empty
        } catch (error) {
          console.error('Error fetching users, using mock data:', error);
          setUsers(mockUsers);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('無法載入數據，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`確定要刪除用戶「${name}」嗎？此操作無法撤銷。`)) {
      try {
        // Call the API to delete the user
        await userApi.delete(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('刪除用戶時發生錯誤，請稍後再試');
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '永久';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">用戶訪問管理</h1>
        <button
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增用戶
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜尋用戶..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? '沒有找到符合的用戶' : '尚未創建任何用戶'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有效期限
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  可訪問的聊天機器人
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.user_type === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.user_type === 'premium' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.user_type === 'admin' && '管理員'}
                      {user.user_type === 'premium' && '高級會員'}
                      {user.user_type === 'free' && '免費用戶'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                      {formatDate(user.access_expiry)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {chatbots.map(chatbot => (
                        <div key={chatbot.id} className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          user.chatbots_access.includes(chatbot.id)
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.chatbots_access.includes(chatbot.id) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {chatbot.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">用戶訪問管理說明</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                在此頁面，您可以管理用戶對不同聊天機器人的訪問權限。您可以：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>創建新用戶並設定其訪問權限</li>
                <li>修改現有用戶的訪問權限</li>
                <li>設定用戶的訂閱類型和有效期限</li>
                <li>分配可訪問的聊天機器人</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccessManagementPage;