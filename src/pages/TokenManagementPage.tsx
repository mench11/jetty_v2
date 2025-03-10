import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle, 
  X, 
  Eye, 
  EyeOff,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { 
  getTokens, 
  createToken, 
  updateToken, 
  deleteToken, 
  validateToken,
  Token
} from '../api/tokenManagement';
import { format } from 'date-fns';

const TokenManagementPage: React.FC = () => {
  const { user } = useAppContext();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTokenValue, setShowTokenValue] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Form state for new/edit token
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    provider: 'openai' as 'openai' | 'deepseek' | 'other',
    isActive: true,
    user_id: ''
  });
  
  // Load tokens on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const data = await getTokens();
        setTokens(data);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('無法載入 API 金鑰，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokens();
  }, []);
  
  // Filter tokens based on search term
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Open add modal
  const handleAddToken = () => {
    setFormData({
      name: '',
      value: '',
      provider: 'openai',
      isActive: true,
      user_id: user?.id || ''
    });
    setIsAddModalOpen(true);
  };
  
  // Open edit modal
  const handleEditToken = (token: Token) => {
    setCurrentToken(token);
    setFormData({
      name: token.name,
      value: token.value,
      provider: token.provider,
      isActive: token.isActive,
      user_id: token.user_id || user?.id || ''
    });
    setIsEditModalOpen(true);
  };
  
  // Handle delete token
  const handleDeleteToken = async (id: string) => {
    if (confirm('確定要刪除此 API 金鑰嗎？此操作無法撤銷。')) {
      try {
        const success = await deleteToken(id);
        if (success) {
          setTokens(tokens.filter(token => token.id !== id));
        } else {
          setError('刪除 API 金鑰時發生錯誤');
        }
      } catch (err) {
        console.error('Error deleting token:', err);
        setError('刪除 API 金鑰時發生錯誤');
      }
    }
  };
  
  // Handle form submission for adding new token
  const handleAddSubmit = async () => {
    if (!formData.name || !formData.value) {
      setError('請填寫所有必填欄位');
      return;
    }
    
    try {
      setIsValidating(true);
      
      // Validate the token
      const isValid = await validateToken(formData.value, formData.provider);
      
      if (!isValid) {
        setError('無效的 API 金鑰格式');
        setIsValidating(false);
        return;
      }
      
      const newToken = await createToken({
        name: formData.name,
        value: formData.value,
        provider: formData.provider,
        isActive: formData.isActive,
        lastUsed: undefined,
        user_id: formData.user_id || user?.id
      });
      
      setTokens([...tokens, newToken]);
      setIsAddModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error adding token:', err);
      setError('新增 API 金鑰時發生錯誤');
    } finally {
      setIsValidating(false);
    }
  };
  
  // Handle form submission for editing token
  const handleEditSubmit = async () => {
    if (!currentToken || !formData.name) {
      setError('請填寫所有必填欄位');
      return;
    }
    
    try {
      // Only validate if the token value has changed
      if (formData.value !== currentToken.value) {
        setIsValidating(true);
        
        // Validate the token
        const isValid = await validateToken(formData.value, formData.provider);
        
        if (!isValid) {
          setError('無效的 API 金鑰格式');
          setIsValidating(false);
          return;
        }
      }
      
      const updatedToken = await updateToken(currentToken.id, {
        name: formData.name,
        value: formData.value || currentToken.value,
        provider: formData.provider,
        isActive: formData.isActive,
        user_id: formData.user_id || user?.id
      });
      
      if (updatedToken) {
        setTokens(tokens.map(token => 
          token.id === currentToken.id ? updatedToken : token
        ));
        setIsEditModalOpen(false);
        setError(null);
      } else {
        setError('更新 API 金鑰時發生錯誤');
      }
    } catch (err) {
      console.error('Error updating token:', err);
      setError('更新 API 金鑰時發生錯誤');
    } finally {
      setIsValidating(false);
    }
  };
  
  // Toggle token visibility
  const toggleTokenVisibility = (id: string) => {
    setShowTokenValue({
      ...showTokenValue,
      [id]: !showTokenValue[id]
    });
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '從未使用';
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };
  
  // Mask token value
  const maskTokenValue = (value: string) => {
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">API 金鑰管理</h1>
        <button
          onClick={handleAddToken}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增 API 金鑰
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
            placeholder="搜尋 API 金鑰..."
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
      ) : filteredTokens.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? '沒有找到符合的 API 金鑰' : '尚未新增任何 API 金鑰'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名稱
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API 金鑰
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提供者
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  使用者
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  使用狀況
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                        <Key className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{token.name}</div>
                        <div className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(token.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {showTokenValue[token.id] ? token.value : maskTokenValue(token.value)}
                      </code>
                      <button
                        onClick={() => toggleTokenVisibility(token.id)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showTokenValue[token.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      token.provider === 'openai' 
                        ? 'bg-green-100 text-green-800' 
                        : token.provider === 'deepseek' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {token.provider === 'openai' && 'OpenAI'}
                      {token.provider === 'deepseek' && 'DeepSeek'}
                      {token.provider === 'other' && '其他'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {token.user_name || '未指定'}
                    </div>
                    {token.user_email && (
                      <div className="text-xs text-gray-500">
                        {token.user_email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      使用次數: {token.usageCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      上次使用: {formatDate(token.lastUsed)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      token.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {token.isActive ? '啟用中' : '已停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditToken(token)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="編輯"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteToken(token.id)}
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
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">新增 API 金鑰</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：OpenAI 生產環境"
                  />
                </div>
                
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                    API 金鑰值 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="例如：sk-xxxxxxxxxxxx"
                  />
                </div>
                
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                    提供者
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                    使用者 ID
                  </label>
                  <input
                    type="text"
                    id="user_id"
                    name="user_id"
                    value={formData.user_id || user?.id || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="使用者 ID"
                  />
                  {user && (
                    <div className="text-xs text-gray-500 mt-1">
                      當前使用者: {user.name} ({user.email})
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    啟用此 API 金鑰
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isValidating}
              >
                取消
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={isValidating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    驗證中...
                  </>
                ) : (
                  '確認'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentToken && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">編輯 API 金鑰</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：OpenAI 生產環境"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700 mb-1">
                    API 金鑰值
                  </label>
                  <input
                    type="text"
                    id="edit-value"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="留空表示不變更"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    如果不需要更改 API 金鑰值，請留空
                  </p>
                </div>
                
                <div>
                  <label htmlFor="edit-provider" className="block text-sm font-medium text-gray-700 mb-1">
                    提供者
                  </label>
                  <select
                    id="edit-provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-isActive" className="ml-2 block text-sm text-gray-700">
                    啟用此 API 金鑰
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isValidating}
              >
                取消
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isValidating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    驗證中...
                  </>
                ) : (
                  '確認'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagementPage;