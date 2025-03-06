import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X,
  Check,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Mock data for question items
const initialQuestionItems = [
  {
    id: '1',
    subject: '英文',
    grade: '1年級',
    unit: 'eng',
    content: 'eg'
  },
  {
    id: '2',
    subject: '中文',
    grade: '1年級',
    unit: '續寫句子',
    content: '**問題: ** 1. 吃飯前，_______。2. 我和哥哥在_______。3. 這隻小貓_______。\n**要求洗手。** 2. 我和哥哥在**公園玩足球。** 3. 這隻小貓**正在睡覺。**\n\n**答案範例: ** 1. 吃飯前，**要先洗手。** 2. 我和哥哥在**公園玩足球。** 3. 這隻小貓**正在睡覺。**'
  },
  {
    id: '3',
    subject: '中文',
    grade: '1年級',
    unit: '依照例句, 仿作句式',
    content: '**問題: ** 句式: ......也...... 例句: 陳老師會做曲奇餅，也會做蛋糕。 1. _______也_______。 句式: ......把...... 例句: 叔叔把汽水喝完了。 2. _______把_______。 句式: ......像...... 例句: 地球像一個巨大的皮球。 3. _______像_______。\n\n**答案範例: ** 1. 小貓會爬樹，**也會跳高**。 2. 妹妹**把玩具收好了**。 3. 月亮**像一面圓圓的鏡子**。'
  },
  {
    id: '4',
    subject: '中文',
    grade: '1年級',
    unit: '供詞填充',
    content: '**選項**: 媽媽 笑臉 老師 椅子 可愛 坐 美味 皮球 樹葉 公園 快樂 貼\n**問題: ** 星期六上午，我們一家人帶小狗到 **1._______** 遊玩。爸爸和 **2._______** 一起 **3._______** 在草地上，還吃了 **4._______** 的三明治。然後，我和小狗在草地上玩耍，他有一雙小小的眼睛，長得很 **5._______**。我們追著一個圓圓的 **6._______** 跑來跑去，玩得非常 **7._______**，爸爸媽媽看見我的 **8._______** 都跟著笑了。'
  },
  {
    id: '5',
    subject: '中文',
    grade: '1年級',
    unit: '擴張句子',
    content: '**問題: ** 例: 上有很多蘋果。 (高大的) 高大的上有很多蘋果。 1. 我的家裡有果子。 (乾淨的) 2. 同學們打球和跑步。 (在操場上) 3. 我們唱生日歌。 (愉快地) 4. 妹妹在紙上畫畫。 (一張) (白色的)\n\n**答案範例: ** 1. **乾淨的**我的家裡有果子。 2. 同學們**在操場上**打球和跑步。 3. 我們**愉快地**唱生日歌。 4. 妹妹在**一張白色的**紙上畫畫。'
  }
];

const QuestionDatabasePage: React.FC = () => {
  const { user } = useAppContext();
  const [questionItems, setQuestionItems] = useState(initialQuestionItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new/edit item
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    unit: '',
    content: ''
  });
  
  // Filter items based on search term
  const filteredItems = questionItems.filter(item => 
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Open add modal
  const handleAddItem = () => {
    setFormData({
      subject: '',
      grade: '',
      unit: '',
      content: ''
    });
    setIsAddModalOpen(true);
  };
  
  // Open edit modal
  const handleEditItem = (item: any) => {
    setCurrentItem(item);
    setFormData({
      subject: item.subject,
      grade: item.grade,
      unit: item.unit,
      content: item.content
    });
    setIsEditModalOpen(true);
  };
  
  // Handle delete item
  const handleDeleteItem = (id: string) => {
    if (confirm('確定要刪除此試題嗎？此操作無法撤銷。')) {
      setQuestionItems(questionItems.filter(item => item.id !== id));
    }
  };
  
  // Handle form submission for adding new item
  const handleAddSubmit = () => {
    if (!formData.subject || !formData.grade || !formData.unit || !formData.content) {
      setError('請填寫所有必填欄位');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      ...formData
    };
    
    setQuestionItems([...questionItems, newItem]);
    setIsAddModalOpen(false);
    setError(null);
  };
  
  // Handle form submission for editing item
  const handleEditSubmit = () => {
    if (!formData.subject || !formData.grade || !formData.unit || !formData.content) {
      setError('請填寫所有必填欄位');
      return;
    }
    
    setQuestionItems(questionItems.map(item => 
      item.id === currentItem.id ? { ...item, ...formData } : item
    ));
    setIsEditModalOpen(false);
    setError(null);
  };
  
  // Truncate content for display
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">試題資料庫</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增單元
          </button>
          <button
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增單元內容
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜尋試題..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                科目
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                年級
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                單元
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                內容
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.grade}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.unit}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md">
                    {truncateContent(item.content)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="編輯"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                      title="刪除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">新增單元內容</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    科目 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="appearance-none w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    >
                      <option value="">選擇科目</option>
                      <option value="中文">中文</option>
                      <option value="英文">英文</option>
                      <option value="數學">數學</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                    年級 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="appearance-none w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    >
                      <option value="">選擇年級</option>
                      <option value="1年級">1年級</option>
                      <option value="2年級">2年級</option>
                      <option value="3年級">3年級</option>
                      <option value="4年級">4年級</option>
                      <option value="5年級">5年級</option>
                      <option value="6年級">6年級</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    單元 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="輸入單元名稱"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    內容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="輸入試題內容"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">編輯單元內容</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-subject" className="block text-sm font-medium text-gray-700 mb-1">
                    科目 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="edit-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="appearance-none w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    >
                      <option value="">選擇科目</option>
                      <option value="中文">中文</option>
                      <option value="英文">英文</option>
                      <option value="數學">數學</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-grade" className="block text-sm font-medium text-gray-700 mb-1">
                    年級 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="edit-grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="appearance-none w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    >
                      <option value="">選擇年級</option>
                      <option value="1年級">1年級</option>
                      <option value="2年級">2年級</option>
                      <option value="3年級">3年級</option>
                      <option value="4年級">4年級</option>
                      <option value="5年級">5年級</option>
                      <option value="6年級">6年級</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700 mb-1">
                    單元 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="輸入單元名稱"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">
                    內容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="edit-content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="輸入試題內容"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDatabasePage;