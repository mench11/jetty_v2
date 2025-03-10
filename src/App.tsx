// React is imported for JSX transformation
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import AssignmentsPage from './pages/AssignmentsPage';
import ContentPage from './pages/ContentPage';
import LanguagePage from './pages/LanguagePage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import ChatbotManagementPage from './pages/admin/ChatbotManagementPage';
import ChatbotFormPage from './pages/admin/ChatbotFormPage';
import UserAccessManagementPage from './pages/admin/UserAccessManagementPage';
import UserTypeManagementPage from './pages/admin/UserTypeManagementPage';
import ExamGeneratorPage from './pages/ExamGeneratorPage';
import QuestionDatabasePage from './pages/QuestionDatabasePage';
import TokenManagementPage from './pages/TokenManagementPage';
import ChatHistoryPage from './pages/ChatHistoryPage';
import DatabaseTestPage from './pages/DatabaseTestPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/language" element={<LanguagePage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/exam-generator" element={<ExamGeneratorPage />} />
            <Route path="/question-database" element={<QuestionDatabasePage />} />
            <Route path="/token-management" element={<TokenManagementPage />} />
            <Route path="/chat-history" element={<ChatHistoryPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/chatbots" element={<ChatbotManagementPage />} />
            <Route path="/admin/chatbots/new" element={<ChatbotFormPage />} />
            <Route path="/admin/chatbots/:id" element={<ChatbotFormPage />} />
            <Route path="/admin/users" element={<UserAccessManagementPage />} />
            <Route path="/admin/user-types" element={<UserTypeManagementPage />} />
            
            {/* Test Routes */}
            <Route path="/database-test" element={<DatabaseTestPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;