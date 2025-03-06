import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Languages, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { practiceLanguage } from '../api/openai';
import { ChatMessage } from '../types';

const LanguageLearning: React.FC = () => {
  const { addLanguagePractice, updateLanguagePractice } = useAppContext();
  const [language, setLanguage] = useState('英語');
  const [level, setLevel] = useState('beginner');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [corrections, setCorrections] = useState<Array<{ original: string; corrected: string; explanation: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to conversation
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    
    setConversation((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get response from API
      const response = await practiceLanguage(language, level, message);
      
      if (response) {
        // Parse the response to extract corrections if any
        const correctionPattern = /原句：(.*?)修正：(.*?)說明：(.*?)(?=原句：|$)/gs;
        const matches = [...response.matchAll(correctionPattern)];
        
        let cleanedResponse = response;
        const newCorrections: Array<{ original: string; corrected: string; explanation: string }> = [];
        
        if (matches.length > 0) {
          // Extract corrections
          matches.forEach((match) => {
            const original = match[1].trim();
            const corrected = match[2].trim();
            const explanation = match[3].trim();
            
            newCorrections.push({ original, corrected, explanation });
            
            // Remove the correction part from the response
            cleanedResponse = cleanedResponse.replace(match[0], '');
          });
          
          setCorrections((prev) => [...prev, ...newCorrections]);
        }
        
        // Add assistant response to conversation
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: cleanedResponse.trim() || response,
          timestamp: Date.now(),
        };
        
        setConversation((prev) => [...prev, assistantMessage]);
        
        // Save or update practice session
        if (!practiceId) {
          const id = Date.now().toString();
          setPracticeId(id);
          addLanguagePractice({
            language,
            level: level as 'beginner' | 'intermediate' | 'advanced',
            conversation: [userMessage, assistantMessage],
            corrections: newCorrections.length > 0 ? newCorrections : undefined,
          });
        } else {
          updateLanguagePractice(practiceId, {
            conversation: [...conversation, userMessage, assistantMessage],
            corrections: [...corrections, ...newCorrections],
          });
        }
      }
    } catch (error) {
      console.error('Error in language practice:', error);
      
      // Add error message to conversation
      setConversation((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，我現在無法回應。請稍後再試。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const startNewConversation = () => {
    setConversation([]);
    setCorrections([]);
    setPracticeId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">語言學習助手</h2>
        <p className="text-gray-600">
          與 AI 進行對話練習，獲得即時糾正和建議。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              語言
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={conversation.length > 0}
            >
              <option value="英語">英語</option>
              <option value="日語">日語</option>
              <option value="法語">法語</option>
              <option value="德語">德語</option>
              <option value="西班牙語">西班牙語</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              程度
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={conversation.length > 0}
            >
              <option value="beginner">初學者</option>
              <option value="intermediate">中級</option>
              <option value="advanced">高級</option>
            </select>
          </div>
        </div>
        
        {conversation.length > 0 && (
          <button
            onClick={startNewConversation}
            className="mt-4 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            開始新對話
          </button>
        )}
      </div>
      
      <div className="flex flex-col h-[calc(100vh-24rem)]">
        <div className="flex-1 p-4 overflow-y-auto">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Languages className="w-16 h-16 mb-4 text-indigo-500" />
              <p className="text-xl font-medium">開始你的語言練習</p>
              <p className="mt-2 text-center">
                用 {language} 與 AI 助手對話，獲得即時反饋和糾正。
              </p>
            </div>
          ) : (
            conversation.map((msg) => (
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
                      <span className="font-medium">你</span>
                    ) : (
                      <span className="font-medium">語言助手</span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-3/4 p-3 rounded-lg bg-white border border-gray-200">
                <div className="flex items-center">
                  <span className="font-medium">語言助手</span>
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
        
        <div className="border-t p-4">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`用${language}輸入...`}
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-indigo-600 text-white p-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {corrections.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex items-center mb-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">語法糾正</h3>
          </div>
          <div className="space-y-2">
            {corrections.map((correction, index) => (
              <div key={index} className="p-3 bg-yellow-50 rounded-md">
                <div className="text-red-500 line-through">{correction.original}</div>
                <div className="text-green-600 font-medium">{correction.corrected}</div>
                <div className="text-gray-600 text-sm mt-1">{correction.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageLearning;