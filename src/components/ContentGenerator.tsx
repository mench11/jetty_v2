import React, { useState } from 'react';
import { BookOpen, Lightbulb, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateLearningMaterial } from '../api/openai';

const ContentGenerator: React.FC = () => {
  const { addLearningMaterial } = useAppContext();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedContent(null);
    
    if (!subject || !topic) {
      setError('請填寫學科和主題');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Generate learning material
      const content = await generateLearningMaterial(
        subject,
        topic,
        difficulty,
        learningStyle
      );
      
      if (content) {
        // Save to context
        addLearningMaterial({
          title: `${subject} - ${topic}`,
          content,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          type: 'exercise',
          subject,
        });
        
        // Display the generated content
        setGeneratedContent(content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError('生成學習內容時發生錯誤，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">個性化學習內容生成器</h2>
        <p className="text-gray-600">
          根據你的需求和學習風格生成定制的學習材料。
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              學科
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：數學、物理、歷史"
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              主題
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：微積分、牛頓定律、第二次世界大戰"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              難度
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isGenerating}
            >
              <option value="easy">簡單</option>
              <option value="medium">中等</option>
              <option value="hard">困難</option>
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
              disabled={isGenerating}
            >
              <option value="visual">視覺型學習者</option>
              <option value="auditory">聽覺型學習者</option>
              <option value="reading">閱讀型學習者</option>
              <option value="kinesthetic">動覺型學習者</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5 mr-2" />
              生成學習內容
            </>
          )}
        </button>
      </form>

      {generatedContent && (
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">生成的學習內容</h3>
          </div>
          <div className="p-4 border rounded-md bg-gray-50 prose max-w-none">
            <div className="whitespace-pre-wrap">{generatedContent}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;