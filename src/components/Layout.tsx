import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  PenTool, 
  Languages, 
  BookMarked, 
  User,
  Menu,
  X,
  LogIn,
  LogOut,
  Settings,
  FileOutput,
  Database,
  Key,
  History,
  Shield
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, setUser, loadUserAccessRights } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: '首頁', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/chat', label: '聊天機器人', icon: <MessageSquare className="w-5 h-5" /> },
    { path: '/assignments', label: '作業評估', icon: <FileText className="w-5 h-5" /> },
    { path: '/content', label: '學習內容', icon: <BookMarked className="w-5 h-5" /> },
    { path: '/language', label: '語言學習', icon: <Languages className="w-5 h-5" /> },
    { path: '/notes', label: '學習筆記', icon: <PenTool className="w-5 h-5" /> },
    { path: '/exam-generator', label: '試卷生成', icon: <FileOutput className="w-5 h-5" /> },
    { path: '/question-database', label: '試題資料庫', icon: <Database className="w-5 h-5" /> },
    { path: '/chat-history', label: '對話歷史', icon: <History className="w-5 h-5" /> },
    { path: '/token-management', label: 'API 金鑰管理', icon: <Key className="w-5 h-5" /> },
    { path: '/profile', label: '個人資料', icon: <User className="w-5 h-5" /> },
  ];

  // Add admin items if user is admin
  const adminItems = [
    { path: '/admin/chatbots', label: '聊天機器人管理', icon: <Settings className="w-5 h-5" /> },
    { path: '/admin/users', label: '用戶訪問管理', icon: <User className="w-5 h-5" /> },
    { path: '/admin/user-types', label: '用戶類型管理', icon: <Shield className="w-5 h-5" /> },
  ];

  const isAdmin = user?.accessRights?.userType === 'admin';
  const allNavItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  const handleLogin = () => {
    // In a real app, this would be a proper login flow
    // For demo purposes, we're just creating a mock user
    const mockUser = {
      id: 'user-123',
      name: '測試用戶',
      email: 'test@example.com',
      preferences: {
        subject: '一般',
        level: 'intermediate' as const,
        learningStyle: 'visual' as const,
      },
      accessRights: {
        chatbots: [],
        accessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        userType: 'admin' as const
      }
    };
    
    setUser(mockUser);
    loadUserAccessRights(mockUser.id);
  };

  const handleLogout = () => {
    if (confirm('確定要登出嗎？')) {
      setUser(null);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">AI 教育助手</h1>
        <button onClick={toggleMobileMenu} className="text-gray-700">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop always visible, Mobile conditionally visible */}
      <div className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
        w-full md:w-64 bg-white shadow-md md:h-screen z-10
        ${isMobileMenuOpen ? 'absolute inset-0' : ''}
        md:overflow-y-auto
      `}>
        <div className="p-4 border-b hidden md:block">
          <h1 className="text-xl font-bold text-indigo-600">AI 教育助手</h1>
        </div>
        
        <div className="p-4 border-b">
          {user ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mt-1">
                    管理員
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              登入
            </button>
          )}
        </div>
        
        <nav className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <ul>
            {allNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 ${
                    location.pathname === item.path ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;