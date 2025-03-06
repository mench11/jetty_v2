import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, FileUp, Clock, Trash2, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateChatResponse, logChatUsage } from '../api/openai';
import { 
  createChatHistoryEntry, 
  addMessageToChatHistory 
} from '../api/chatHistory';
import { v4 as uuidv4 } from 'uuid';

const ChatInterface: React.FC = () => {
  const { 
    user,
    chatHistory, 
    addChatMessage, 
    clearChatHistory,
    currentChatbotId,
    currentChatbotConfig,
    chatSessions,
    addChatSession
  } = useAppContext();
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Track usage count for the current chatbot
  useEffect(() => {
    if (currentChatbotId) {
      const currentChatbotMessages = chatHistory.filter(
        msg => msg.chatbotId === currentChatbotId && msg.role === 'user'
      );
      setUsageCount(currentChatbotMessages.length);
    } else {
      setUsageCount(0);
    }
  }, [chatHistory, currentChatbotId]);

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;
    if (!currentChatbotId || !currentChatbotConfig) {
      alert('請先選擇一個聊天機器人');
      return;
    }

    // Check if user has reached daily limit
    if (usageCount >= currentChatbotConfig.dailyLimit) {
      alert(`您已達到今日使用限制 (${currentChatbotConfig.dailyLimit} 次對話)`);
      return;
    }

    // Prepare message content
    let content = message;
    if (file) {
      // In a real app, you would upload the file and get a URL or process it
      content += `\n[已上傳檔案: ${file.name}]`;
    }

    // Add user message to chat
    const messageId = uuidv4();
    addChatMessage({ 
      role: 'user', 
      content,
      id: messageId
    });
    setIsLoading(true);
    
    try {
      // Create a new chat session if this is the first message
      let sessionId = currentSessionId;
      if (!sessionId) {
        if (chatHistory.filter(msg => msg.chatbotId === currentChatbotId).length === 0) {
          const sessionTitle = message.length > 30 
            ? message.substring(0, 30) + '...' 
            : message;
          
          const newSessionId = uuidv4();
          addChatSession({
            chatbotId: currentChatbotId,
            title: sessionTitle,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messageCount: 1
          });
          
          // Create chat history entry
          if (user) {
            await createChatHistoryEntry(
              user.id,
              currentChatbotId,
              content,
              currentChatbotConfig.model,
              currentChatbotConfig.provider || 'openai'
            );
          }
          
          sessionId = newSessionId;
          setCurrentSessionId(newSessionId);
        }
      }
      
      // Prepare messages for API
      const messages = [
        { role: 'system', content: currentChatbotConfig.systemPrompt },
        ...chatHistory
          .filter(msg => msg.chatbotId === currentChatbotId)
          .map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content }
      ];
      
      // Get response from API
      const response = await generateChatResponse(
        messages, 
        currentChatbotConfig.model,
        currentChatbotConfig.provider || 'openai'
      );
      
      // Add assistant response to chat
      if (response) {
        const responseId = uuidv4();
        addChatMessage({ 
          role: 'assistant', 
          content: response,
          chatbotId: currentChatbotId,
          id: responseId
        });
        
        // Add message to chat history
        if (sessionId && user) {
          await addMessageToChatHistory(
            sessionId,
            { role: 'assistant', content: response },
            {
              prompt: content.length / 4, // Rough estimate
              completion: response.length / 4, // Rough estimate
              total: (content.length + response.length) / 4 // Rough estimate
            }
          );
        }
      }

      // Log usage
      if (user) {
        await logChatUsage(
          user.id, 
          currentChatbotId, 
          1, 
          content.length + (response?.length || 0)
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addChatMessage({ 
        role: 'assistant', 
        content: '抱歉，我現在無法回應。請稍後再試。',
        chatbotId: currentChatbotId,
        id: uuidv4()
      });
    } finally {
      setIsLoading(false);
      setMessage('');
      setFile(null);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if file uploads are allowed for this chatbot
      if (currentChatbotConfig && !currentChatbotConfig.hasFileAccess) {
        alert('此聊天機器人不支援檔案上傳');
        e.target.value = '';
        return;
      }
      
      // Check file size (limit to 5MB for example)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過 5MB');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleNewChat = () => {
    if (chatHistory.length > 0 && confirm('確定要開始新的對話嗎？當前對話將被清除。')) {
      clearChatHistory();
      setCurrentSessionId(null);
    } else if (chatHistory.length === 0) {
      clearChatHistory();
      setCurrentSessionId(null);
    }
  };

  // Filter chat history for the current chatbot
  const currentChatbotHistory = chatHistory.filter(
    msg => msg.chatbotId === currentChatbotId || !msg.chatbotId
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {currentChatbotConfig ? currentChatbotConfig.name : '請選擇聊天機器人'}
          </h2>
          {currentChatbotConfig && (
            <div className="flex items-center">
              <p className="text-sm text-gray-600 mr-3">
                今日已使用: {usageCount}/{currentChatbotConfig.dailyLimit} 次對話
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                currentChatbotConfig.provider === 'openai' 
                  ? 'bg-green-100 text-green-800' 
                  : currentChatbotConfig.provider === 'deepseek' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {currentChatbotConfig.provider === 'openai' && 'OpenAI'}
                {currentChatbotConfig.provider === 'deepseek' && 'DeepSeek'}
                {(!currentChatbotConfig.provider || currentChatbotConfig.provider === 'other') && '其他'}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleNewChat}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="開始新對話"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {currentChatbotHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-16 h-16 mb-4 text-indigo-500" />
            <p className="text-xl font-medium">
              {currentChatbotConfig 
                ? `歡迎使用 ${currentChatbotConfig.name}` 
                : '請從側邊欄選擇一個聊天機器人'}
            </p>
            {currentChatbotConfig && currentChatbotConfig.welcomeMessage && (
              <p className="mt-2 text-center">
                {currentChatbotConfig.welcomeMessage}
              </p>
            )}
          </div>
        ) : (
          currentChatbotHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-4 ${
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
                    <>
                      <span className="font-medium">你</span>
                      <User className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span className="font-medium">AI 助手</span>
                      <Bot className="w-4 h-4 ml-1" />
                    </>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-3/4 p-3 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center">
                <span className="font-medium">AI 助手</span>
                <Bot className="w-4 h-4 ml-1" />
              </div>
              <div className="mt-2 flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {file && (
        <div className="px-4 py-2 bg-gray-50 border-t flex justify-between items-center">
          <div className="flex items-center">
            <FileUp className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="text-sm text-gray-700">{file.name}</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="border-t p-4">
        <div className="flex">
          {currentChatbotConfig?.hasFileAccess && (
            <button
              onClick={handleFileSelect}
              className="p-2 bg-gray-100 text-gray-700 rounded-l-lg hover:bg-gray-200 focus:outline-none"
              disabled={isLoading}
            >
              <FileUp className="w-5 h-5" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </button>
          )}
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={currentChatbotConfig ? "輸入你的問題..." : "請先選擇聊天機器人"}
            className={`flex-1 p-2 border ${currentChatbotConfig?.hasFileAccess ? 'rounded-none' : 'rounded-l-lg'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || !currentChatbotConfig}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim() && !file || !currentChatbotConfig}
            className="bg-indigo-600 text-white p-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {currentChatbotConfig && (
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>
              <Clock className="w-3 h-3 inline mr-1" />
              回應可能需要幾秒鐘
            </span>
            <span>
              模型: {currentChatbotConfig.model}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;