import React, { useState } from 'react';
import { User, Settings, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAppContext();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState(user?.preferences?.subject || '');
  const [level, setLevel] = useState(user?.preferences?.level || 'beginner');
  const [learningStyle, setLearningStyle] = useState(user?.preferences?.learningStyle || 'visual');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    setUser({
      id: user?.id || Date.now().toString(),
      name,
      email,
      preferences: {
        subject,
        level: level as 'beginner' | 'intermediate' | 'advanced',
        learningStyle: learningStyle as 'visual' | 'auditory' | 'reading' | 'kinesthetic',
      },
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <User className="w-8 h-8 text-indigo-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-800">個人資料</h2>
      </div>

      {isSaved && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <Save className="w-5 h-5 mr-2" />
          資料已保存！
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="輸入你的姓名"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="輸入你的電子郵件"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">學習偏好</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                主要學科
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：數學、物理、歷史"
              />
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                學習程度
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="beginner">初學者</option>
                <option value="intermediate">中級</option>
                <option value="advanced">高級</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 mb-1">
                學習風格
              </label>
              <select
                id="learningStyle"
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="visual">視覺型學習者</option>
                <option value="auditory">聽覺型學習者</option>
                <option value="reading">閱讀型學習者</option>
                <option value="kinesthetic">動覺型學習者</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          保存設置
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;