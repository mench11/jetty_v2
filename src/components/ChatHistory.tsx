import React, { useState } from 'react';
import { MessageSquare, Trash2, Clock, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ChatHistory: React.FC = () => {
  const { 
    chatSessions, 
    deleteChatSession, 
    currentChatbotId 
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chat sessions for the current chatbot
  const filteredSessions = chatSessions
    .filter(session => 
      session.chatbotId === currentChatbotId && 
      session.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('確定要刪除此對話嗎？')) {
      deleteChatSession(sessionId);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">對話歷史</h2>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="搜尋對話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {currentChatbotId ? (
            searchTerm ? '沒有找到符合的對話' : '尚無對話歷史'
          ) : (
            '請先選擇一個聊天機器人'
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div 
              key={session.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <MessageSquare className="w-5 h-5 text-indigo-500 mt-1 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-800">{session.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(session.updatedAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{session.messageCount} 則訊息</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;