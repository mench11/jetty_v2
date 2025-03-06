import React from 'react';
import { Bot, Lock, FileText, Database } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ChatbotAccess } from '../types';

const ChatbotSelector: React.FC = () => {
  const { 
    user, 
    currentChatbotId, 
    setCurrentChatbotId, 
    clearChatHistory,
    isLoading
  } = useAppContext();

  const handleSelectChatbot = (chatbotId: string) => {
    if (currentChatbotId !== chatbotId) {
      if (confirm('切換聊天機器人將清除當前對話。確定要繼續嗎？')) {
        setCurrentChatbotId(chatbotId);
        clearChatHistory();
      }
    }
  };

  if (!user?.accessRights) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>請先登入以查看可用的聊天機器人</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">可用的聊天機器人</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {user.accessRights.chatbots.map((chatbot: ChatbotAccess) => (
            <div 
              key={chatbot.id}
              onClick={() => handleSelectChatbot(chatbot.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                currentChatbotId === chatbot.id 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${
                  currentChatbotId === chatbot.id 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-800">{chatbot.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    每日限制: {chatbot.dailyLimit} 次對話
                  </p>
                  <div className="flex mt-2 space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {chatbot.hasFileAccess ? '支援檔案上傳' : '不支援檔案上傳'}
                    </span>
                    <span className="flex items-center">
                      <Database className="w-3 h-3 mr-1" />
                      {chatbot.model}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          訂閱有效期至: {user.accessRights.accessExpiry 
            ? new Date(user.accessRights.accessExpiry).toLocaleDateString() 
            : '永久'}
        </p>
        <p className="mt-1">
          用戶類型: {user.accessRights.userType === 'premium' ? '高級會員' : '免費用戶'}
        </p>
      </div>
    </div>
  );
};

export default ChatbotSelector;