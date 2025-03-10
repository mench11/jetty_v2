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
  X,
  Save
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { chatbotApi, userApi, userTypeApi } from '../../api/apiService';

const UserAccessManagementPage: React.FC = () => {
  const { user } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    user_type: 'free',
    access_expiry: '',
    chatbots_access: [] as string[]
  });
  
  // We no longer need mock users here as they're now in the API service

  useEffect(() => {
    // Check if user is admin
    if (!user || user.accessRights?.userType !== 'admin') {
      window.location.href = '/';
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        // Fetch data in parallel for better performance
        const [chatbotsData, userTypesData, usersData] = await Promise.allSettled([
          chatbotApi.getAll(),
          userTypeApi.getAll(),
          userApi.getAll()
        ]);
        
        // Handle chatbots data
        if (chatbotsData.status === 'fulfilled') {
          setChatbots(chatbotsData.value);
        } else {
          console.error('Error fetching chatbots:', chatbotsData.reason);
          // Use empty array if fetch fails
          setChatbots([]);
        }
        
        // Handle user types data
        if (userTypesData.status === 'fulfilled') {
          setUserTypes(userTypesData.value);
        } else {
          console.error('Error fetching user types:', userTypesData.reason);
          // Set default user types if fetch fails
          setUserTypes([
            { id: 'admin', name: '管理員' },
            { id: 'premium', name: '高級會員' },
            { id: 'free', name: '免費用戶' }
          ]);
        }
        
        // Handle users data
        if (usersData.status === 'fulfilled') {
          setUsers(usersData.value);
          console.log('Successfully fetched users data from database');
        } else {
          console.error('Error fetching users:', usersData.reason);
          setError('無法載入用戶數據，請稍後再試');
          setUsers([]);
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('載入數據時發生錯誤，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    // Add null checks to prevent errors with undefined properties
    const userName = user?.name || '';
    const userEmail = user?.email || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return userName.toLowerCase().includes(searchTermLower) ||
           userEmail.toLowerCase().includes(searchTermLower);
  });

  // Handle create user
  const handleCreateUser = async () => {
    // Validate form data
    if (!formData.name || !formData.email) {
      setError('用戶名稱和郵箱為必填項');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的電子郵箱地址');
      return;
    }
    
    try {
      setError(null); // Clear any previous errors
      setIsLoading(true); // Show loading state
      
      // Prepare user data for database
      const newUser = {
        name: formData.name,
        email: formData.email,
        user_type: formData.user_type,
        password_hash: '$2a$10$dummyhashforzhang', // Default password hash
        access_expiry: formData.access_expiry || null,
        chatbots_access: formData.chatbots_access,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null
      };
      
      // Call API to create user
      const createdUser = await userApi.create(newUser);
      
      if (!createdUser || !createdUser.id) {
        throw new Error('創建用戶失敗，伺服器未返回有效數據');
      }
      
      // Update users list with the returned data from API
      setUsers([...users, createdUser]);
      setIsCreateModalOpen(false);
      setSuccess('用戶創建成功');
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        user_type: 'free',
        access_expiry: '',
        chatbots_access: []
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      // Provide more specific error messages based on the error
      if (err.message && err.message.includes('duplicate')) {
        setError('該電子郵箱已被使用，請使用其他郵箱');
      } else {
        setError(`創建用戶時發生錯誤: ${err.message || '請稍後再試'}`);
      }
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };
  
  // Handle update user
  const handleUpdateUser = async () => {
    // Validate form data
    if (!currentUser || !formData.name || !formData.email) {
      setError('用戶名稱和郵箱為必填項');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的電子郵箱地址');
      return;
    }
    
    try {
      setError(null); // Clear any previous errors
      setIsLoading(true); // Show loading state
      
      // Prepare user data for database update - only include fields that exist in the database
      const updatedUser = {
        name: formData.name,
        email: formData.email,
        user_type: formData.user_type
        // Let the database handle the updated_at timestamp automatically
        // Don't include fields that don't exist in the database schema
      };
      
      console.log('Updating user with data:', JSON.stringify(updatedUser));
      
      // Call API to update user
      const result = await userApi.update(currentUser.id, updatedUser);
      
      if (!result) {
        throw new Error('更新用戶失敗，伺服器未返回有效數據');
      }
      
      // Update users list with the returned data from API
      setUsers(users.map(u => u.id === currentUser.id ? result : u));
      setIsEditModalOpen(false);
      setSuccess('用戶更新成功');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      // Provide more specific error messages based on the error
      if (err.message && err.message.includes('duplicate')) {
        setError('該電子郵箱已被其他用戶使用，請使用其他郵箱');
      } else {
        setError(`更新用戶時發生錯誤: ${err.message || '請稍後再試'}`);
      }
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };
  
  // Handle edit button click
  const handleEditClick = (user: any) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      user_type: user.user_type || 'free',
      // Initialize with empty values for UI fields that don't exist in the database
      access_expiry: '',
      chatbots_access: []
    });
    console.log('Editing user:', JSON.stringify(user));
    setIsEditModalOpen(true);
  };
  
  // Handle add button click
  const handleAddClick = () => {
    setFormData({
      name: '',
      email: '',
      user_type: 'free',
      access_expiry: '',
      chatbots_access: []
    });
    setIsCreateModalOpen(true);
  };
  
  // Handle checkbox change for chatbot access
  const handleChatbotAccessChange = (chatbotId: string) => {
    setFormData(prev => {
      const chatbots_access = [...prev.chatbots_access];
      if (chatbots_access.includes(chatbotId)) {
        return {
          ...prev,
          chatbots_access: chatbots_access.filter(id => id !== chatbotId)
        };
      } else {
        return {
          ...prev,
          chatbots_access: [...chatbots_access, chatbotId]
        };
      }
    });
  };
  
  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`確定要刪除用戶「${name}」嗎？此操作無法撤銷。`)) {
      try {
        setError(null); // Clear any previous errors
        setIsLoading(true); // Show loading state
        
        // Call the API to delete the user
        const result = await userApi.delete(id);
        
        if (result && result.success) {
          setUsers(users.filter(user => user.id !== id));
          setSuccess('用戶刪除成功');
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error('刪除操作未返回成功狀態');
        }
      } catch (err: any) {
        console.error('Error deleting user:', err);
        // Provide more specific error messages
        if (err.message && err.message.includes('foreign key')) {
          setError('無法刪除此用戶，因為有關聯的資料依賴於它');
        } else if (err.message && err.message.includes('permission')) {
          setError('您沒有權限刪除此用戶');
        } else {
          setError(`刪除用戶時發生錯誤: ${err.message || '請稍後再試'}`);
        }
      } finally {
        setIsLoading(false); // Hide loading state
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
          onClick={handleAddClick}
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
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {success}
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
                          user.chatbots_access && Array.isArray(user.chatbots_access) && user.chatbots_access.includes(chatbot.id)
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.chatbots_access && Array.isArray(user.chatbots_access) && user.chatbots_access.includes(chatbot.id) ? (
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
                        onClick={() => handleEditClick(user)}
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
      
      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">新增用戶</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用戶名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="輸入用戶名稱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電子郵箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="輸入電子郵箱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用戶類型</label>
                <select
                  value={formData.user_type}
                  onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {userTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">訪問有效期</label>
                <input
                  type="date"
                  value={formData.access_expiry}
                  onChange={(e) => setFormData({...formData, access_expiry: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">留空表示永久訪問權限</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">可訪問的聊天機器人</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {chatbots.map(chatbot => (
                  <div key={chatbot.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`create-chatbot-${chatbot.id}`}
                      checked={formData.chatbots_access.includes(chatbot.id)}
                      onChange={() => handleChatbotAccessChange(chatbot.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`create-chatbot-${chatbot.id}`} className="ml-2 text-sm text-gray-700">
                      {chatbot.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                創建用戶
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">編輯用戶</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用戶名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="輸入用戶名稱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電子郵箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="輸入電子郵箱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用戶類型</label>
                <select
                  value={formData.user_type}
                  onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {userTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">訪問有效期</label>
                <input
                  type="date"
                  value={formData.access_expiry}
                  onChange={(e) => setFormData({...formData, access_expiry: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">留空表示永久訪問權限</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">可訪問的聊天機器人</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {chatbots.map(chatbot => (
                  <div key={chatbot.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`edit-chatbot-${chatbot.id}`}
                      checked={formData.chatbots_access.includes(chatbot.id)}
                      onChange={() => handleChatbotAccessChange(chatbot.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`edit-chatbot-${chatbot.id}`} className="ml-2 text-sm text-gray-700">
                      {chatbot.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                更新用戶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessManagementPage;