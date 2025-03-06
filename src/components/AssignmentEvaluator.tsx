import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { evaluateAssignment } from '../api/openai';

const AssignmentEvaluator: React.FC = () => {
  const { addAssignment, updateAssignment } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [criteria, setCriteria] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title || !content) {
      setError('請填寫作業標題和內容');
      return;
    }

    try {
      // Create a new assignment
      const newAssignment = {
        title,
        description,
        content,
        submittedAt: Date.now(),
      };
      
      addAssignment(newAssignment);
      setCurrentAssignmentId(Date.now().toString());
      setSuccess('作業已提交，正在評估中...');
      setIsEvaluating(true);
      
      // Evaluate the assignment
      const evaluationCriteria = criteria || '評分標準：內容完整性、論點清晰度、語法正確性、創意思考';
      const feedback = await evaluateAssignment(content, evaluationCriteria);
      
      // Extract score from feedback (assuming the AI includes a score in its response)
      const scoreMatch = feedback?.match(/(\d+)\/100|score:?\s*(\d+)|(\d+)\s*分/i);
      const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : undefined;
      
      // Update the assignment with feedback
      if (currentAssignmentId) {
        updateAssignment(currentAssignmentId, {
          feedback,
          score,
          evaluatedAt: Date.now(),
        });
      }
      
      setSuccess('作業評估完成！');
    } catch (error) {
      console.error('Error evaluating assignment:', error);
      setError('評估作業時發生錯誤，請稍後再試');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setCriteria('');
    setCurrentAssignmentId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">作業評估工具</h2>
        <p className="text-gray-600">
          提交你的作業，AI 將為你提供詳細的評估和改進建議。
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            作業標題
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：中文作文、數學問題集"
            disabled={isEvaluating}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            作業描述（選填）
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="簡短描述作業要求"
            disabled={isEvaluating}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            作業內容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
            placeholder="在此粘貼或輸入你的作業內容..."
            disabled={isEvaluating}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-1">
            評分標準（選填）
          </label>
          <textarea
            id="criteria"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="指定特定的評分標準，例如：論點清晰度、語法正確性、創意思考..."
            disabled={isEvaluating}
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isEvaluating}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isEvaluating ? (
              <>
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                評估中...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                提交作業
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isEvaluating}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            重置
          </button>
        </div>
      </form>

      {currentAssignmentId && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <div className="flex items-center mb-2">
            <FileText className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">提交狀態</h3>
          </div>
          <p className="text-gray-600 mb-2">
            作業 ID: {currentAssignmentId.substring(0, 8)}...
          </p>
          <p className="text-gray-600">
            提交時間: {new Date().toLocaleString()}
          </p>
          {isEvaluating && (
            <div className="mt-2 text-indigo-600">
              正在評估你的作業，請稍候...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentEvaluator;