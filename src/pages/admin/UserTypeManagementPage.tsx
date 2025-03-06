import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Check,
  X,
  Calendar,
  Shield,
  Info
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

// Mock data for user types
const initialUserTypes = [
  {
    id: 'type-1',
    name: '管理員',
    description: '擁有系統所有功能的完整訪問權限，可以管理用戶、聊天機器人和系統設置。',
    status: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    accessiblePages: ['all']
  },
  {
    id: 'type-2',
    name: '高級會員',
    description: '可以訪問所有學習功能，包括聊天機器人、作業評估、內容生成等，但無管理權限。',
    status: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z',
    accessiblePages: ['/chat', '/assignments', '/content', '/language', '/notes', '/exam-generator', '/question-database', '/chat-history']
  },
  {
    id: 'type-3',
    name: '基本會員',
    description: '僅可訪問基本聊天功能和有限的學習資源。',
    status: true,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z',
    accessiblePages: ['/chat', '/notes']
  },
  {
    id: 'type-4',
    name: '試用會員',
    description: '有限時間內可訪問部分功能，用於評估系統。',
    status: false,
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-04-20T00:00:00Z',
    accessiblePages: ['/chat']
  }
];

// Available pages for access control
const availablePages = [
  { id: 'all', name: '所有頁面', description: '完整系統訪問權限' },
  { id: '/chat', name: '聊天機器人', description: '與 AI 聊天機器人互動' },
  { id: '/assignments', name: '作業評估', description: '提交和評估作業' },
  { id: '/content', name: '學習內容', description: '生成個性化學習內容' },
  { id: '/language', name: '語言學習', description: '語言學習和練習' },
  { id: '/notes', name: '學習筆記', description: '創建和增強學習筆記' },
  { id: '/exam-generator', name: '試卷生成', description: '生成自定義試卷' },
  { id: '/question-database', name: '試題資料庫', description: '管理試題資料' },
  { id: '/chat-history', name: '對話歷史', description: '查看過去的對話' },
  { id: '/token-management', name: 'API 金鑰管理', description: '管理 API 金鑰' },
  { id: '/admin/chatbots', name: '聊天機器人管理', description: '管理聊天機器人設置' },
  { id: '/admin/users', name: '用戶訪問管理', description: '管理用戶訪問權限' }
];

const UserTypeManagementPage: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [userTypes, setUserTypes] = useState(initialUserTypes);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: true,
    accessiblePages: [] as string[]
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  useEffect(() => {
    // Check if user is admin
    if (!user || user.accessRights?.userType !== 'admin') {
      navigate('/');
      return;
    }

    // Simulate loading data
    const loadData = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setUserTypes(initialUserTypes);
      } catch (err) {
        console.error('Error loading user types:', err);
        setError('無法載入用戶類型數據，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);
  
  // Filter user types based on search term
  const filteredUserTypes = userTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUserTypes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUserTypes.length / itemsPerPage);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle checkbox change for status
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      status: e.target.checked
    });
  };
  
  // Handle page access toggle
  const handlePageAccessToggle = (pageId: string) => {
    if (pageId === 'all') {
      // If "all" is selected, clear other selections and only select "all"
      setFormData({
        ...formData,
        accessiblePages: formData.accessiblePages.includes('all') ? [] : ['all']
      });
    } else {
      // If "all" was previously selected, remove it
      let updatedPages = formData.accessiblePages.filter(id => id !== 'all');
      
      // Toggle the selected page
      if (updatedPages.includes(pageId)) {
        updatedPages = updatedPages.filter(id => id !== pageId);
      } else {
        updatedPages.push(pageId);
      }
      
      setFormData({
        ...formData,
        accessiblePages: updatedPages
      });
    }
  };
  
  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      status: true,
      accessiblePages: []
    });
    setIsCreateModalOpen(true);
  };
  
  // Open edit modal
  const handleOpenEditModal = (userType: any) => {
    setCurrentUserType(userType);
    setFormData({
      name: userType.name,
      description: userType.description,
      status: userType.status,
      accessiblePages: userType.accessiblePages
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete modal
  const handleOpenDeleteModal = (userType: any) => {
    setCurrentUserType(userType);
    setIsDeleteModalOpen(true);
  };
  
  // Handle create user type
  const handleCreateUserType = () => {
    if (!formData.name) {
      setError('用戶類型名稱為必填項');
      return;
    }
    
    try {
      const newUserType = {
        id: `type-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessiblePages: formData.accessiblePages
      };
      
      setUserTypes([...userTypes, newUserType]);
      setIsCreateModalOpen(false);
      setSuccess('用戶類型創建成功');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating user type:', err);
      setError('創建用戶類型時發生錯誤');
    }
  };
  
  // Handle update user type
  const handleUpdateUserType = () => {
    if (!currentUserType || !formData.name) {
      setError('用戶類型名稱為必填項');
      return;
    }
    
    try {
      const updatedUserTypes = userTypes.map(type => 
        type.id === currentUserType.id 
          ? {
              ...type,
              name: formData.name,
              description: formData.description,
              status: formData.status,
              updatedAt: new Date().toISOString(),
              accessiblePages: formData.accessiblePages
            }
          : type
      );
      
      setUserTypes(updatedUserTypes);
      setIsEditModalOpen(false);
      setSuccess('用戶類型更新成功');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating user type:', err);
      setError('更新用戶類型時發生錯誤');
    }
  };
  
  // Handle delete user type
  const handleDeleteUserType = () => {
    if (!currentUserType) return;
    
    try {
      const updatedUserTypes = userTypes.filter(type => type.id !== currentUserType.id);
      setUserTypes(updatedUserTypes);
      setIsDeleteModalOpen(false);
      setSuccess('用戶類型刪除成功');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting user type:', err);
      setError('刪除用戶類型時發生錯誤');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">用戶類型管理</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          創建用戶類型
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
            placeholder="搜尋用戶類型..."
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
      ) : filteredUserTypes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? '沒有找到符合的用戶類型' : '尚未創建任何用戶類型'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶類型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  創建日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後修改
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((userType) => (
                <tr key={userType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                        <Shield className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userType.name}</div>
                        <div className="text-xs text-gray-500">ID: {userType.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{userType.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userType.status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userType.status ? '啟用中' : '已停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(userType.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(userType.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(userType)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="編輯"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(userType)}
                        className="text-red-600 hover:text-red-900"
                        title="刪除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-6 py-3 border-t">
              <div className="text-sm text-gray-700">
                顯示 {indexOfFirstItem + 1} 至 {Math.min(indexOfLastItem, filteredUserTypes.length)} 項，共 {filteredUserTypes.length} 項
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">創建用戶類型</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    用戶類型名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：管理員、高級會員、基本會員"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="描述此用戶類型的權限和用途..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleStatusChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
                    啟用此用戶類型
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    可訪問頁面
                  </label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {availablePages.map(page => (
                        <div key={page.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`page-${page.id}`}
                            checked={formData.accessiblePages.includes(page.id)}
                            onChange={() => handlePageAccessToggle(page.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`page-${page.id}`} className="ml-2 block text-sm text-gray-700">
                            <span className="font-medium">{page.name}</span>
                            {page.description && (
                              <span className="text-gray-500 ml-2">- {page.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    選擇「所有頁面」將授予完整系統訪問權限
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateUserType}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                創建
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {isEditModalOpen && currentUserType && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">編輯用戶類型</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    用戶類型名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：管理員、高級會員、基本會員"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="描述此用戶類型的權限和用途..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-status"
                    name="status"
                    checked={formData.status}
                    onChange={handleStatusChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-status" className="ml-2 block text-sm text-gray-700">
                    啟用此用戶類型
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    可訪問頁面
                  </label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {availablePages.map(page => (
                        <div key={page.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`edit-page-${page.id}`}
                            checked={formData.accessiblePages.includes(page.id)}
                            onChange={() => handlePageAccessToggle(page.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`edit-page-${page.id}`} className="ml-2 block text-sm text-gray-700">
                            <span className="font-medium">{page.name}</span>
                            {page.description && (
                              <span className="text-gray-500 ml-2">- {page.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    選擇「所有頁面」將授予完整系統訪問權限
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdateUserType}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentUserType && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">確認刪除</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center text-red-600 mb-4">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <span className="font-medium">警告：此操作無法撤銷</span>
              </div>
              <p className="text-gray-700">
                您確定要刪除用戶類型「<span className="font-medium">{currentUserType.name}</span>」嗎？
                此操作將永久刪除該用戶類型，且無法恢復。
              </p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                <p className="flex items-start">
                  <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    刪除用戶類型可能會影響已分配此類型的用戶。建議在刪除前先確保沒有用戶正在使用此類型。
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleDeleteUserType}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">用戶類型管理說明</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                用戶類型定義了不同用戶在系統中的權限和訪問級別。您可以：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>創建新的用戶類型並設定其權限</li>
                <li>編輯現有用戶類型的名稱、描述和狀態</li>
                <li>為每種用戶類型設定可訪問的頁面</li>
                <li>停用不再需要的用戶類型</li>
              </ul>
              <p className="mt-2">
                注意：刪除用戶類型前，請確保沒有用戶正在使用該類型，以避免權限問題。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeManagementPage;