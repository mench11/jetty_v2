import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BookOpen, 
  Settings, 
  Check, 
  X, 
  Download, 
  Save,
  Loader,
  AlertTriangle
} from 'lucide-react';

// Mock data for templates
const initialTemplates = [
  {
    id: '1',
    subject: '中文',
    grade: '1年級',
    name: '基礎句型練習',
    description: '針對一年級學生的基礎句型練習，包含仿作句式、續寫句子等',
    status: true,
    createdAt: '2023-05-15T00:00:00Z'
  },
  {
    id: '2',
    subject: '中文',
    grade: '2年級',
    name: '閱讀理解測驗',
    description: '二年級學生的閱讀理解能力測驗，包含短文閱讀和問答題',
    status: true,
    createdAt: '2023-06-20T00:00:00Z'
  },
  {
    id: '3',
    subject: '數學',
    grade: '1年級',
    name: '基礎加減法',
    description: '一年級學生的基礎加減法練習，包含應用題和計算題',
    status: false,
    createdAt: '2023-07-10T00:00:00Z'
  }
];

// Mock data for units
const initialUnits = [
  {
    id: '1',
    subject: '中文',
    grade: '1年級',
    name: '續寫句子',
    content: '練習根據前半句完成句子',
    examples: [
      '下雨天，我會帶傘出門。',
      '媽媽每天都會做好吃的晚餐。',
      '學校的圖書館裡有很多故事書。'
    ]
  },
  {
    id: '2',
    subject: '中文',
    grade: '1年級',
    name: '依照例句，仿作句式',
    content: '根據例句的結構，使用相同的句式造句',
    examples: [
      '句式: ......也......',
      '例句: 陳老師會做曲奇餅，也會做蛋糕。',
      '句式: ......把......',
      '例句: 叔叔把汽水喝完了。'
    ]
  },
  {
    id: '3',
    subject: '中文',
    grade: '1年級',
    name: '擴張句子',
    content: '練習擴充簡單句子，加入更多描述',
    examples: [
      '簡單句: 小明吃蘋果。',
      '擴張句: 小明開心地吃著紅紅的蘋果。'
    ]
  },
  {
    id: '4',
    subject: '中文',
    grade: '1年級',
    name: '供詞填充',
    content: '使用提供的詞語填空完成句子',
    examples: [
      '詞語: 開心、學校、朋友',
      '句子: 我和_____一起去_____玩，感到很_____。'
    ]
  }
];

const ExamGeneratorPage: React.FC = () => {
  // State for different views
  const [currentView, setCurrentView] = useState<'templates' | 'create' | 'units' | 'addUnit' | 'preview' | 'generating' | 'result'>('templates');
  
  // State for templates
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for units
  const [units, setUnits] = useState(initialUnits);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  
  // State for new unit form
  const [newUnit, setNewUnit] = useState({
    subject: '中文',
    grade: '1年級',
    name: '',
    content: ''
  });
  
  // State for exam creation
  const [selectedSubject, setSelectedSubject] = useState('中文');
  const [selectedGrade, setSelectedGrade] = useState('1年級');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // State for generated exam
  const [generatedExam, setGeneratedExam] = useState<any>(null);
  
  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter units based on selected subject and grade
  const filteredUnits = units.filter(unit => 
    unit.subject === selectedSubject && unit.grade === selectedGrade
  );
  
  // Handle template status toggle
  const toggleTemplateStatus = (id: string) => {
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, status: !template.status } : template
    ));
  };
  
  // Handle template deletion
  const deleteTemplate = (id: string) => {
    if (confirm('確定要刪除此模板嗎？此操作無法撤銷。')) {
      setTemplates(templates.filter(template => template.id !== id));
    }
  };
  
  // Handle unit selection
  const toggleUnitSelection = (id: string) => {
    if (selectedUnits.includes(id)) {
      setSelectedUnits(selectedUnits.filter(unitId => unitId !== id));
    } else {
      setSelectedUnits([...selectedUnits, id]);
    }
  };
  
  // Handle new unit submission
  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.content) {
      alert('請填寫單元名稱和內容');
      return;
    }
    
    const newUnitWithId = {
      id: Date.now().toString(),
      ...newUnit,
      examples: []
    };
    
    setUnits([...units, newUnitWithId]);
    setNewUnit({
      subject: '中文',
      grade: '1年級',
      name: '',
      content: ''
    });
    setCurrentView('units');
  };
  
  // Handle exam generation
  const generateExam = () => {
    if (selectedUnits.length === 0) {
      alert('請至少選擇一個單元');
      return;
    }
    
    setCurrentView('generating');
    
    // Simulate exam generation with a delay
    setTimeout(() => {
      // Create a mock generated exam
      const selectedUnitObjects = units.filter(unit => selectedUnits.includes(unit.id));
      
      const mockExam = {
        title: `**${selectedGrade}${selectedSubject}能力評量卷**`,
        subject: selectedSubject,
        grade: selectedGrade,
        sections: selectedUnitObjects.map((unit, index) => ({
          id: index + 1,
          title: `**${toChineseNumber(index + 1)}、${unit.name}（每題${3 + index}分，共${(3 + index) * 3}分）**`,
          description: unit.content,
          questions: unit.examples.map((example, qIndex) => ({
            id: qIndex + 1,
            content: example,
            answer: `**示範答案**`
          }))
        }))
      };
      
      setGeneratedExam(mockExam);
      setCurrentView('result');
    }, 2000);
  };
  
  // Convert number to Chinese number
  const toChineseNumber = (num: number): string => {
    const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return chineseNumbers[num - 1];
    if (num < 20) return '十' + (num > 10 ? chineseNumbers[num - 11] : '');
    return chineseNumbers[Math.floor(num / 10) - 1] + '十' + (num % 10 > 0 ? chineseNumbers[num % 10 - 1] : '');
  };
  
  // Render different views based on current state
  const renderView = () => {
    switch (currentView) {
      case 'templates':
        return renderTemplatesView();
      case 'create':
        return renderCreateExamView();
      case 'units':
        return renderUnitsView();
      case 'addUnit':
        return renderAddUnitView();
      case 'preview':
        return renderPreviewView();
      case 'generating':
        return renderGeneratingView();
      case 'result':
        return renderResultView();
      default:
        return renderTemplatesView();
    }
  };
  
  // Render templates management view
  const renderTemplatesView = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">試卷生成 - 模板管理</h1>
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          開始生成試卷
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜尋模板..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 px-6 py-3 border-b">
          <div className="flex-1 font-medium text-gray-700">模板名稱</div>
          <div className="flex-1 font-medium text-gray-700">科目 / 年級</div>
          <div className="flex-1 font-medium text-gray-700">狀態</div>
          <div className="w-24 font-medium text-gray-700 text-right">操作</div>
        </div>
        
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? '沒有找到符合的模板' : '尚未創建任何模板'}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="px-6 py-4 border-b last:border-b-0 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {template.subject}
                  </div>
                  <div className="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {template.grade}
                  </div>
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => toggleTemplateStatus(template.id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      template.status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {template.status ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        啟用中
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        未啟用
                      </>
                    )}
                  </button>
                </div>
                <div className="w-24 flex justify-end space-x-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900"
                    title="編輯"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-900"
                    title="刪除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => {/* Add template modal logic */}}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增設定
        </button>
      </div>
    </div>
  );
  
  // Render create exam view (subject and grade selection)
  const renderCreateExamView = () => (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('templates')}
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回模板列表
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">選擇科目和年級</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">科目</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['中文', '英文', '數學'].map((subject) => (
              <div
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                  selectedSubject === subject 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <BookOpen className={`w-6 h-6 ${selectedSubject === subject ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <span className={`ml-2 text-lg ${selectedSubject === subject ? 'font-semibold text-indigo-700' : 'text-gray-700'}`}>
                    {subject}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">年級</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['1年級', '2年級', '3年級', '4年級', '5年級', '6年級'].map((grade) => (
              <div
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                  selectedGrade === grade 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className={`text-lg ${selectedGrade === grade ? 'font-semibold text-indigo-700' : 'text-gray-700'}`}>
                    {grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setCurrentView('units')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-lg font-medium"
          >
            確認開始生成
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render units selection view
  const renderUnitsView = () => (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('create')}
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回選擇科目和年級
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedSubject} - {selectedGrade} 單元內容
          </h1>
          <button
            onClick={() => setCurrentView('addUnit')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增單元內容
          </button>
        </div>
        
        {filteredUnits.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">尚未創建任何單元內容</p>
            <button
              onClick={() => setCurrentView('addUnit')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              新增單元內容
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUnits.includes(unit.id) 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => toggleUnitSelection(unit.id)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${
                    selectedUnits.includes(unit.id) 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedUnits.includes(unit.id) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-800">{unit.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{unit.content}</p>
                    {unit.examples.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                        <p className="font-medium text-gray-700">示例:</p>
                        {unit.examples.map((example, index) => (
                          <p key={index} className="text-gray-600">{example}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div className="text-gray-600">
            已選擇 {selectedUnits.length} 個單元
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('preview')}
              disabled={selectedUnits.length === 0}
              className="px-4 py-2 border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              預覽試卷內容
            </button>
            <button
              onClick={generateExam}
              disabled={selectedUnits.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              生成試卷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render add unit view
  const renderAddUnitView = () => (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('units')}
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回單元列表
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">新增單元內容</h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                科目
              </label>
              <select
                id="subject"
                value={newUnit.subject}
                onChange={(e) => setNewUnit({...newUnit, subject: e.target.value})}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="中文">中文</option>
                <option value="英文">英文</option>
                <option value="數學">數學</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                年級
              </label>
              <select
                id="grade"
                value={newUnit.grade}
                onChange={(e) => setNewUnit({...newUnit, grade: e.target.value})}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1年級">1年級</option>
                <option value="2年級">2年級</option>
                <option value="3年級">3年級</option>
                <option value="4年級">4年級</option>
                <option value="5年級">5年級</option>
                <option value="6年級">6年級</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              單元名稱
            </label>
            <input
              type="text"
              id="name"
              value={newUnit.name}
              onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：續寫句子、依照例句仿作句式"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              單元內容
            </label>
            <textarea
              id="content"
              value={newUnit.content}
              onChange={(e) => setNewUnit({...newUnit, content: e.target.value})}
              rows={6}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="請輸入單元的詳細內容描述..."
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setCurrentView('units')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleAddUnit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              確認新增
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render preview view
  const renderPreviewView = () => {
    const selectedUnitObjects = units.filter(unit => selectedUnits.includes(unit.id));
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">試題內容參考</h2>
              <button
                onClick={() => setCurrentView('units')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
            <div className="mb-6">
              <p className="text-gray-700">
                <span className="font-medium">年級:</span> {selectedGrade}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">科目:</span> {selectedSubject}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">單元選擇 (可多選)</h3>
              <div className="space-y-2">
                {selectedUnitObjects.map((unit) => (
                  <div key={unit.id} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>{unit.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              {selectedUnitObjects.map((unit) => (
                <div key={unit.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">{unit.name}</h3>
                  <p className="text-gray-600 mb-4">{unit.content}</p>
                  
                  {unit.examples.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium text-gray-700 mb-2">試題內容:</p>
                      {unit.examples.map((example, index) => (
                        <p key={index} className="text-gray-600 mb-1">{example}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                試題模板選擇
              </p>
              <select
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">預設模板</option>
                {templates
                  .filter(t => t.subject === selectedSubject && t.grade === selectedGrade && t.status)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                }
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('units')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={generateExam}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render generating view (loading)
  const renderGeneratingView = () => (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="w-24 h-24 mb-8">
        <Loader className="w-full h-full text-indigo-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">試卷生成中...</h2>
      <p className="text-gray-600">
        正在根據您選擇的單元生成試卷，請稍候...
      </p>
    </div>
  );
  
  // Render result view
  const renderResultView = () => (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('units')}
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回單元選擇
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">生成試卷結果</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">選擇生成的項目</h2>
          <div className="flex space-x-4">
            <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {selectedGrade}
            </div>
            <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {selectedSubject}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 text-white p-6 rounded-lg mb-6 overflow-auto max-h-[60vh]">
          <div className="whitespace-pre-wrap font-mono text-sm">
            <p className="text-center text-xl mb-4">{generatedExam?.title}</p>
            <p className="text-center mb-8">---</p>
            
            {generatedExam?.sections.map((section: any) => (
              <div key={section.id} className="mb-8">
                <p className="mb-4">{section.title}</p>
                <p className="mb-2">{section.description}</p>
                
                {section.questions.map((question: any, index: number) => (
                  <div key={index} className="mb-4">
                    <p>{index + 1}. {question.content}</p>
                    {question.answer && (
                      <p className="text-gray-400 mt-1">{question.answer}</p>
                    )}
                  </div>
                ))}
                
                <p className="mb-4">---</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="w-5 h-5 mr-2" />
              匯出PDF
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download className="w-5 h-5 mr-2" />
              匯出Word
            </button>
          </div>
          
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <Save className="w-5 h-5 mr-2" />
              儲存
            </button>
            <button className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50">
              <Trash2 className="w-5 h-5 mr-2" />
              棄置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {renderView()}
    </div>
  );
};

export default ExamGeneratorPage;