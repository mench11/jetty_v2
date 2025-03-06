import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Database, 
  Search,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { simulateDbOperations } from '../../api/db';

const ChatbotManagementPage: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.accessRights?.userType !== 'admin') {
      navigate('/');
      return;
    }

    // Fetch chatbots
    const fetchChatbots = async () => {
      try {
        setIsLoading(true);
        const data = await simulateDbOperations.getChatbots();
        setChatbots(data);
      } catch (err) {
        console.error('Error fetching chatbots:', err);
        setError('無法載入聊天機器人列表，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbots();
  }, [user, navigate]);

  const handleDeleteChatbot = async (id: string, name: string) => {
    if (confirm(`確定要刪除「${name}」聊天機器人嗎？此操作無法撤銷。`)) {
      try {
        await simulateDbOperations.deleteChatbot(id);
        setChatbots(chatbots.filter(chatbot => chatbot.id !== id));
      } catch (err) {
        console.error('Error deleting chatbot:', err);
        setError('刪除聊天機器人時發生錯誤，請稍後再試');
      }
    }
  };

  // Filter chatbots based on search term
  const filteredChatbots = chatbots.filter(chatbot => 
    chatbot.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">聊天機器人管理</h1>
        <Link
          to="/admin/chatbots/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增聊天機器人
        </Link>
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
            placeholder="搜尋聊天機器人..."
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
      ) : filteredChatbots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? '沒有找到符合的聊天機器人' : '尚未創建任何聊天機器人'}
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
                  模型
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  每日限制
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  功能
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  回應語言
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChatbots.map((chatbot) => (
                <tr key={chatbot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                        <Bot className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{chatbot.name}</div>
                        <div className="text-sm text-gray-500">ID: {chatbot.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chatbot.model}</div>
                    <div className="text-sm text-gray-500">
                      {chatbot.max_tokens} tokens
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chatbot.daily_limit} 次對話</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {chatbot.has_file_access && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FileText className="w-3 h-3 mr-1" />
                          檔案上傳
                        </span>
                      )}
                      {chatbot.knowledge_base_enabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Database className="w-3 h-3 mr-1" />
                          知識庫
                        </span>
                      )}
                      {chatbot.emoji_mode && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          表情符號
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {chatbot.response_language === 'zh-HK' && '繁體中文廣東話'}
                      {chatbot.response_language === 'en' && 'English'}
                      {chatbot.response_language === 'zh-CN' && '简体中文'}
                      {chatbot.response_language === 'zh-TW' && '繁體中文書面語'}
                    </div>
                    <div className="text-sm text-gray-500">
                      溫度: {chatbot.temperature}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/chatbots/${chatbot.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteChatbot(chatbot.id, chatbot.name)}
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
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-blue-800">提示</h3>
            <p className="text-sm text-blue-700 mt-1">
              創建聊天機器人後，您需要在「用戶訪問管理」頁面為用戶分配訪問權限。
              每個聊天機器人可以設定不同的系統提示詞、回應語言和其他參數。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotManagementPage;