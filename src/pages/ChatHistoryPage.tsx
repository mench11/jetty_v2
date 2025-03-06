import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Calendar, 
  Tag,
  Clock,
  Download,
  Filter,
  ChevronDown,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { 
  getChatHistory, 
  deleteChatHistory, 
  formatChatHistoryForDisplay
} from '../api/chatHistory';

const ChatHistoryPage: React.FC = () => {
  const { user } = useAppContext();
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [displayHistory, setDisplayHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  
  // Load chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const history = await getChatHistory(user.id);
        setChatHistory(history);
        
        // Format history for display
        const formattedHistory = formatChatHistoryForDisplay(history);
        setDisplayHistory(formattedHistory);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('無法載入對話歷史，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [user]);
  
  // Filter chat history based on search term and filters
  useEffect(() => {
    if (chatHistory.length === 0) return;
    
    let filtered = formatChatHistoryForDisplay(chatHistory);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(chat => {
          const chatDate = new Date(chat.date);
          return chatDate >= today;
        });
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        filtered = filtered.filter(chat => {
          const chatDate = new Date(chat.date);
          return chatDate >= weekAgo;
        });
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        filtered = filtered.filter(chat => {
          const chatDate = new Date(chat.date);
          return chatDate >= monthAgo;
        });
      }
    }
    
    // Apply model filter
    if (modelFilter !== 'all') {
      filtered = filtered.filter(chat => 
        chat.model.toLowerCase().includes(modelFilter.toLowerCase())
      );
    }
    
    // Apply provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter(chat => {
        const fullChat = chatHistory.find(h => h.sessionId === chat.id);
        return fullChat && fullChat.metadata.provider === providerFilter;
      });
    }
    
    setDisplayHistory(filtered);
  }, [chatHistory, searchTerm, dateFilter, modelFilter, providerFilter]);
  
  // Handle delete chat history
  const handleDeleteChat = async (id: string) => {
    if (confirm('確定要刪除此對話歷史嗎？此操作無法撤銷。')) {
      try {
        const success = await deleteChatHistory(id);
        if (success) {
          setChatHistory(chatHistory.filter(chat => chat.sessionId !== id));
          if (selectedChat && selectedChat.sessionId === id) {
            setSelectedChat(null);
          }
        } else {
          setError('刪除對話歷史時發生錯誤');
        }
      } catch (err) {
        console.error('Error deleting chat history:', err);
        setError('刪除對話歷史時發生錯誤');
      }
    }
  };
  
  // Handle view chat details
  const handleViewChat = (id: string) => {
    const chat = chatHistory.find(chat => chat.sessionId === id);
    setSelectedChat(chat);
  };
  
  // Handle export chat history
  const handleExportChat = (id: string) => {
    const chat = chatHistory.find(chat => chat.sessionId === id);
    if (!chat) return;
    
    // Format chat for export
    const exportData = {
      title: chat.metadata.title,
      date: chat.metadata.startTime,
      model: chat.metadata.model,
      provider: chat.metadata.provider,
      messages: chat.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    };
    
    // Create a blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Reset filters
  const resetFilters = () => {
    setDateFilter('all');
    setModelFilter('all');
    setProviderFilter('all');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">對話歷史</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-1" />
            篩選
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">篩選選項</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              重置篩選
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                日期
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">所有時間</option>
                <option value="today">今天</option>
                <option value="week">過去一週</option>
                <option value="month">過去一個月</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="modelFilter" className="block text-sm font-medium text-gray-700 mb-1">
                模型
              </label>
              <select
                id="modelFilter"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">所有模型</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5">GPT-3.5</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="providerFilter" className="block text-sm font-medium text-gray-700 mb-1">
                提供者
              </label>
              <select
                id="providerFilter"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">所有提供者</option>
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜尋對話歷史..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat history list */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : displayHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || dateFilter !== 'all' || modelFilter !== 'all' || providerFilter !== 'all' 
                ? '沒有找到符合的對話歷史' 
                : '尚無對話歷史'}
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[70vh]">
              {displayHistory.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => handleViewChat(chat.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedChat && selectedChat.sessionId === chat.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <MessageSquare className="w-5 h-5 text-indigo-500 mt-1 mr-2" />
                      <div>
                        <h3 className="font-medium text-gray-800">{chat.title}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{chat.date}</span>
                          <span className="mx-2">•</span>
                          <span>{chat.messageCount} 則訊息</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {chat.preview}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chat.model.includes('gpt-4') 
                          ? 'bg-green-100 text-green-800' 
                          : chat.model.includes('deepseek') 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chat.model}
                      </span>
                      <div className="mt-2 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportChat(chat.id);
                          }}
                          className="text-gray-400 hover:text-indigo-600"
                          title="匯出"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Chat detail view */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedChat.metadata.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(selectedChat.metadata.startTime).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedChat.metadata.model.includes('gpt-4') 
                      ? 'bg-green-100 text-green-800' 
                      : selectedChat.metadata.model.includes('deepseek') 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedChat.metadata.model}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedChat.metadata.provider === 'openai' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedChat.metadata.provider === 'deepseek' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedChat.metadata.provider === 'openai' && 'OpenAI'}
                    {selectedChat.metadata.provider === 'deepseek' && 'DeepSeek'}
                    {selectedChat.metadata.provider === 'other' && '其他'}
                  </span>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[60vh] space-y-4">
                {selectedChat.messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-3/4 p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-indigo-100 text-gray-800'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {msg.role === 'user' ? (
                          <span className="font-medium">你</span>
                        ) : (
                          <span className="font-medium">AI 助手</span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedChat.metadata.tokenUsage && (
                <div className="mt-4 pt-3 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Token 使用統計</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">提示 Tokens:</span>
                      <span className="ml-2 font-medium">{selectedChat.metadata.tokenUsage.prompt}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">回應 Tokens:</span>
                      <span className="ml-2 font-medium">{selectedChat.metadata.tokenUsage.completion}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">總計 Tokens:</span>
                      <span className="ml-2 font-medium">{selectedChat.metadata.tokenUsage.total}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedChat.tags && selectedChat.tags.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">標籤</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedChat.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 border rounded-lg p-12">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">選擇一個對話</p>
              <p className="text-center">
                從左側列表中選擇一個對話以查看詳細內容
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryPage;