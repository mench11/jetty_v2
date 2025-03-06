import React, { useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import ChatbotSelector from '../components/ChatbotSelector';
import ChatHistory from '../components/ChatHistory';
import { useAppContext } from '../context/AppContext';

const ChatPage: React.FC = () => {
  const { user, loadUserAccessRights } = useAppContext();

  // Load user access rights when the component mounts
  useEffect(() => {
    if (user && !user.accessRights) {
      loadUserAccessRights(user.id);
    }
  }, [user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <ChatbotSelector />
        <ChatHistory />
      </div>
      <div className="lg:col-span-2">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;