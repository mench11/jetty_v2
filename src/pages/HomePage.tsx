import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, BookOpen, Languages, PenTool, Settings, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const HomePage: React.FC = () => {
  const { user } = useAppContext();
  
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12 text-indigo-500" />,
      title: '聊天機器人',
      description: '根據不同需求選擇專業的AI聊天機器人，獲得即時回應和幫助。',
      path: '/chat',
    },
    {
      icon: <FileText className="w-12 h-12 text-indigo-500" />,
      title: '自動作業評估工具',
      description: '學生提交作業後，系統能自動評分並提供改進建議。',
      path: '/assignments',
    },
    {
      icon: <BookOpen className="w-12 h-12 text-indigo-500" />,
      title: '個性化教學內容生成器',
      description: '根據學生的程度和學習風格自動生成定制學習材料。',
      path: '/content',
    },
    {
      icon: <Languages className="w-12 h-12 text-indigo-500" />,
      title: '語言學習助手',
      description: '幫助學生學習新語言，提供會話練習和糾正。',
      path: '/language',
    },
    {
      icon: <PenTool className="w-12 h-12 text-indigo-500" />,
      title: '協作學習筆記增強器',
      description: '幫助學生整理和增強他們的學習筆記。',
      path: '/notes',
    },
  ];

  return (
    <div>
      <div className="bg-indigo-600 text-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">歡迎使用 AI 教育助手</h1>
        <p className="text-xl mb-6">
          利用人工智能技術提升你的學習體驗，獲得個性化的教育支持。
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/chat"
            className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            開始使用聊天機器人
          </Link>
          {!user && (
            <button
              onClick={() => alert('請先登入以使用完整功能')}
              className="inline-block px-6 py-3 bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-white"
            >
              登入帳號
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.path}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">{feature.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h2>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">管理員功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">聊天機器人管理</h3>
            </div>
            <p className="text-gray-600 mb-4">
              創建和配置不同用途的聊天機器人，設定系統提示詞、知識庫連接和使用限制。
            </p>
            <button
              onClick={() => alert('此功能需要管理員權限')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              進入管理介面
            </button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">用戶訪問管理</h3>
            </div>
            <p className="text-gray-600 mb-4">
              管理用戶訪問權限，設定可訪問的聊天機器人、使用限制和有效期限。
            </p>
            <button
              onClick={() => alert('此功能需要管理員權限')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              管理用戶權限
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;