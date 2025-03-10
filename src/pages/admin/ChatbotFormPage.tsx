import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Bot, 
  AlertTriangle, 
  HelpCircle,
  MessageSquare,
  Database,
  Smile,
  Thermometer
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { chatbotApi } from '../../api/apiService';

const ChatbotFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [provider, setProvider] = useState<'openai' | 'deepseek' | 'other'>('openai');
  const [dailyLimit, setDailyLimit] = useState(50);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [hasFileAccess, setHasFileAccess] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(false);
  const [responseLanguage, setResponseLanguage] = useState<'zh-HK' | 'en' | 'zh-CN' | 'zh-TW'>('zh-TW');
  const [temperature, setTemperature] = useState(0.7);
  const [emojiMode, setEmojiMode] = useState(false);
  const [role, setRole] = useState('');
  const [principles, setPrinciples] = useState('');
  const [interactionExamples, setInteractionExamples] = useState('');
  
  // Active tab
  const [activeTab, setActiveTab] = useState('basic');

  // Generate a unique ID for new chatbots
  const generateUniqueId = () => {
    return `chatbot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || user.accessRights?.userType !== 'admin') {
      navigate('/');
      return;
    }

    // If editing an existing chatbot, fetch its data
    if (id) {
      const fetchChatbot = async () => {
        try {
          setIsLoading(true);
          const chatbot = await chatbotApi.getById(id);
          
          if (!chatbot) {
            setError('找不到指定的聊天機器人');
            return;
          }
          
          // Set form values
          setName(chatbot.name);
          setModel(chatbot.model);
          setProvider(chatbot.provider || 'openai');
          setDailyLimit(chatbot.daily_limit);
          setMaxTokens(chatbot.max_tokens);
          setHasFileAccess(chatbot.has_file_access);
          setSystemPrompt(chatbot.system_prompt);
          setWelcomeMessage(chatbot.welcome_message || '');
          setKnowledgeBase(chatbot.knowledge_base || '');
          setKnowledgeBaseEnabled(chatbot.knowledge_base_enabled);
          setResponseLanguage(chatbot.response_language);
          setTemperature(chatbot.temperature);
          setEmojiMode(chatbot.emoji_mode);
          setRole(chatbot.role || '');
          setPrinciples(chatbot.principles || '');
          setInteractionExamples(chatbot.interaction_examples || '');
        } catch (err) {
          console.error('Error fetching chatbot:', err);
          setError('載入聊天機器人資料時發生錯誤');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchChatbot();
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('請輸入聊天機器人名稱');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const chatbotData = {
        id: id || generateUniqueId(),
        name,
        model,
        provider,
        dailyLimit,
        maxTokens,
        hasFileAccess,
        systemPrompt,
        welcomeMessage,
        knowledgeBase: knowledgeBaseEnabled ? knowledgeBase : null,
        responseLanguage,
        temperature,
        emojiMode,
        role,
        principles,
        interactionExamples,
        knowledgeBaseEnabled
      };
      
      if (id) {
        // Update existing chatbot
        await chatbotApi.update(id, chatbotData);
      } else {
        // Create new chatbot
        await chatbotApi.create(chatbotData);
      }
      
      // Redirect to chatbot management page
      navigate('/admin/chatbots');
    } catch (err) {
      console.error('Error saving chatbot:', err);
      setError('儲存聊天機器人時發生錯誤');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/chatbots')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? '編輯聊天機器人' : '新增聊天機器人'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-indigo-500  text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bot className="w-5 h-5 inline mr-2" />
              基本設定
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prompt'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              預提示設定
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advanced'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-5 h-5 inline mr-2" />
              進階設定
            </button>
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Settings Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                聊天機器人名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：一般學習助手、數學專家"
                required
              />
            </div>
            
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                AI 提供者
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'openai' | 'deepseek' | 'other')}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                AI 模型
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {provider === 'openai' && (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
                {provider === 'deepseek' && (
                  <>
                    <option value="deepseek-chat">DeepSeek Chat</option>
                    <option value="deepseek-coder">DeepSeek Coder</option>
                  </>
                )}
                {provider === 'other' && (
                  <option value="custom-model">自定義模型</option>
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  每日使用限制（次數）
                </label>
                <input
                  type="number"
                  id="dailyLimit"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
                  最大 Token 數
                </label>
                <input
                  type="number"
                  id="maxTokens"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  min="100"
                  step="100"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasFileAccess"
                  checked={hasFileAccess}
                  onChange={(e) => setHasFileAccess(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="hasFileAccess" className="ml-2 block text-sm text-gray-700">
                  允許檔案上傳
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                啟用後，用戶可以上傳檔案供聊天機器人分析
              </p>
            </div>
            
            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">
                歡迎訊息
              </label>
              <input
                type="text"
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：你好！我是你的學習助手，有什麼我可以幫助你的嗎？"
              />
              <p className="mt-1 text-sm text-gray-500">
                用戶開始對話時顯示的歡迎訊息
              </p>
            </div>
          </div>
        )}
        
        {/* Prompt Settings Tab */}
        {activeTab === 'prompt' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="responseLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                回應語言
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="lang-zh-HK"
                    name="responseLanguage"
                    value="zh-HK"
                    checked={responseLanguage === 'zh-HK'}
                    onChange={() => setResponseLanguage('zh-HK')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="lang-zh-HK" className="ml-2 block text-sm text-gray-700">
                    繁體中文廣東話
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="lang-en"
                    name="responseLanguage"
                    value="en"
                    checked={responseLanguage === 'en'}
                    onChange={() => setResponseLanguage('en')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="lang-en" className="ml-2 block text-sm text-gray-700">
                    English
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="lang-zh-CN"
                    name="responseLanguage"
                    value="zh-CN"
                    checked={responseLanguage === 'zh-CN'}
                    onChange={() => setResponseLanguage('zh-CN')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="lang-zh-CN" className="ml-2 block text-sm text-gray-700">
                    简体中文
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="lang-zh-TW"
                    name="responseLanguage"
                    value="zh-TW"
                    checked={responseLanguage === 'zh-TW'}
                    onChange={() => setResponseLanguage('zh-TW')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="lang-zh-TW" className="ml-2 block text-sm text-gray-700">
                    繁體中文書面語
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                  溫度 ({temperature})
                </label>
                <Thermometer className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>精確 (0.0)</span>
                <span>平衡 (0.7)</span>
                <span>創意 (1.0)</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emojiMode"
                  checked={emojiMode}
                  onChange={(e) => setEmojiMode(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="emojiMode" className="ml-2 block text-sm text-gray-700">
                  表情符號模式
                </label>
                <Smile className="w-4 h-4 text-yellow-500 ml-2" />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                啟用後，聊天機器人會在回應中適當使用表情符號
              </p>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                角色定位
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：教育助手、數學教師"
              />
            </div>
            
            <div>
              <label htmlFor="principles" className="block text-sm font-medium text-gray-700 mb-1">
                原則
              </label>
              <textarea
                id="principles"
                value={principles}
                onChange={(e) => setPrinciples(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="列出聊天機器人應遵循的原則，每行一條"
              />
            </div>
            
            <div>
              <label htmlFor="interactionExamples" className="block text-sm font-medium text-gray-700 mb-1">
                互動示例
              </label>
              <textarea
                id="interactionExamples"
                value={interactionExamples}
                onChange={(e) => setInteractionExamples(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="提供問答示例，格式如：問：什麼是光合作用？答：光合作用是..."
              />
            </div>
            
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                其他注意事項
              </label>
              <textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="輸入完整的系統提示詞，定義聊天機器人的行為和回應方式"
              />
              <p className="mt-1 text-sm text-gray-500">
                系統訊息是發送給 AI 的指令，用戶不會看到這些內容
              </p>
            </div>
          </div>
        )}
        
        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="knowledgeBaseEnabled"
                  checked={knowledgeBaseEnabled}
                  onChange={(e) => setKnowledgeBaseEnabled(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="knowledgeBaseEnabled" className="ml-2 block text-sm text-gray-700">
                  啟用知識庫
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                啟用後，聊天機器人可以使用指定的知識庫回答問題
              </p>
            </div>
            
            {knowledgeBaseEnabled && (
              <div>
                <label htmlFor="knowledgeBase" className="block text-sm font-medium text-gray-700 mb-1">
                  知識庫 ID
                </label>
                <input
                  type="text"
                  id="knowledgeBase"
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="輸入知識庫 ID"
                />
                <p className="mt-1 text-sm text-gray-500">
                  請輸入已創建的知識庫 ID，例如：math-textbooks
                </p>
              </div>
            )}
            
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">注意事項</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      進階設定可能需要額外的配置和資源。請確保您已經創建了相應的知識庫，並且已經上傳了必要的文件。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/chatbots')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                儲存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                儲存
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotFormPage;