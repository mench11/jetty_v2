import React, { useState } from 'react';
import { PenTool, FileText, Sparkles, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { enhanceNotes } from '../api/openai';

const NotesEnhancer: React.FC = () => {
  const { addNote, updateNote } = useAppContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedNote, setEnhancedNote] = useState<{
    summary?: string;
    keyPoints?: string[];
    reviewQuestions?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);

  const handleEnhance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title || !content) {
      setError('請填寫筆記標題和內容');
      return;
    }

    try {
      setIsEnhancing(true);
      
      // Save the original note first
      if (!noteId) {
        const id = Date.now().toString();
        setNoteId(id);
        addNote({
          title,
          content,
        });
      }
      
      // Enhance the notes
      const enhancedContent = await enhanceNotes(content);
      
      if (enhancedContent) {
        // Parse the enhanced content
        const summaryMatch = enhancedContent.match(/(?:摘要|Summary):(.*?)(?=\n\n|\n[A-Z]|$)/s);
        const summary = summaryMatch ? summaryMatch[1].trim() : undefined;
        
        // Extract key points
        const keyPointsMatch = enhancedContent.match(/(?:關鍵概念|Key Concepts):(.*?)(?=\n\n|\n[A-Z]|$)/s);
        const keyPointsText = keyPointsMatch ? keyPointsMatch[1].trim() : '';
        const keyPoints = keyPointsText
          .split(/\n-|\n\d+\./)
          .map(point => point.trim())
          .filter(point => point.length > 0);
        
        // Extract review questions
        const questionsMatch = enhancedContent.match(/(?:複習問題|Review Questions):(.*?)(?=\n\n|\n[A-Z]|$)/s);
        const questionsText = questionsMatch ? questionsMatch[1].trim() : '';
        const reviewQuestions = questionsText
          .split(/\n-|\n\d+\./)
          .map(question => question.trim())
          .filter(question => question.length > 0);
        
        // Update the note with enhanced content
        if (noteId) {
          updateNote(noteId, {
            summary,
            keyPoints,
            reviewQuestions,
          });
        }
        
        // Display the enhanced note
        setEnhancedNote({
          summary,
          keyPoints,
          reviewQuestions,
        });
      }
    } catch (error) {
      console.error('Error enhancing notes:', error);
      setError('增強筆記時發生錯誤，請稍後再試');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setEnhancedNote(null);
    setError(null);
    setNoteId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">學習筆記增強器</h2>
        <p className="text-gray-600">
          上傳你的學習筆記，AI 將幫助你提取關鍵概念、生成摘要和複習問題。
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleEnhance} className="mb-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            筆記標題
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：細胞生物學第三章筆記"
            disabled={isEnhancing}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            筆記內容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
            placeholder="在此粘貼或輸入你的筆記內容..."
            disabled={isEnhancing}
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isEnhancing}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isEnhancing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                增強中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                增強筆記
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isEnhancing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            重置
          </button>
        </div>
      </form>

      {enhancedNote && (
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">增強後的筆記</h3>
          </div>
          
          {enhancedNote.summary && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">摘要</h4>
              <div className="p-3 bg-gray-50 rounded-md">
                {enhancedNote.summary}
              </div>
            </div>
          )}
          
          {enhancedNote.keyPoints && enhancedNote.keyPoints.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">關鍵概念</h4>
              <ul className="list-disc pl-5 space-y-1">
                {enhancedNote.keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-800">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {enhancedNote.reviewQuestions && enhancedNote.reviewQuestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">複習問題</h4>
              <ul className="list-decimal pl-5 space-y-2">
                {enhancedNote.reviewQuestions.map((question, index) => (
                  <li key={index} className="text-gray-800">{question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesEnhancer;