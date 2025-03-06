import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  ChatMessage, 
  Assignment, 
  Note, 
  LearningMaterial, 
  LanguagePractice, 
  ChatSession,
  ChatbotConfig
} from '../types';
import { fetchUserAccessRights, fetchChatbotConfig } from '../api/openai';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  learningMaterials: LearningMaterial[];
  addLearningMaterial: (material: Omit<LearningMaterial, 'id'>) => void;
  languagePractices: LanguagePractice[];
  addLanguagePractice: (practice: Omit<LanguagePractice, 'id'>) => void;
  updateLanguagePractice: (id: string, updates: Partial<LanguagePractice>) => void;
  chatSessions: ChatSession[];
  addChatSession: (session: Omit<ChatSession, 'id'>) => void;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void;
  deleteChatSession: (id: string) => void;
  currentChatbotId: string | null;
  setCurrentChatbotId: (id: string | null) => void;
  currentChatbotConfig: ChatbotConfig | null;
  loadUserAccessRights: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [languagePractices, setLanguagePractices] = useState<LanguagePractice[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatbotId, setCurrentChatbotId] = useState<string | null>(null);
  const [currentChatbotConfig, setCurrentChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
      chatbotId: currentChatbotId || undefined
    };
    setChatHistory((prev) => [...prev, newMessage]);
    
    // Update the current chat session if it exists
    if (currentChatbotId && chatSessions.length > 0) {
      const currentSession = chatSessions.find(
        session => session.chatbotId === currentChatbotId
      );
      if (currentSession) {
        updateChatSession(currentSession.id, {
          messageCount: currentSession.messageCount + 1,
          updatedAt: Date.now()
        });
      }
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
    };
    setAssignments((prev) => [...prev, newAssignment]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id ? { ...assignment, ...updates } : assignment
      )
    );
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: now.toString(),
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      )
    );
  };

  const addLearningMaterial = (material: Omit<LearningMaterial, 'id'>) => {
    const newMaterial: LearningMaterial = {
      ...material,
      id: Date.now().toString(),
    };
    setLearningMaterials((prev) => [...prev, newMaterial]);
  };

  const addLanguagePractice = (practice: Omit<LanguagePractice, 'id'>) => {
    const newPractice: LanguagePractice = {
      ...practice,
      id: Date.now().toString(),
    };
    setLanguagePractices((prev) => [...prev, newPractice]);
  };

  const updateLanguagePractice = (id: string, updates: Partial<LanguagePractice>) => {
    setLanguagePractices((prev) =>
      prev.map((practice) =>
        practice.id === id ? { ...practice, ...updates } : practice
      )
    );
  };

  const addChatSession = (session: Omit<ChatSession, 'id'>) => {
    const newSession: ChatSession = {
      ...session,
      id: Date.now().toString(),
    };
    setChatSessions((prev) => [...prev, newSession]);
    return newSession.id;
  };

  const updateChatSession = (id: string, updates: Partial<ChatSession>) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      )
    );
  };

  const deleteChatSession = (id: string) => {
    setChatSessions((prev) => prev.filter((session) => session.id !== id));
  };

  const loadUserAccessRights = async (userId: string) => {
    try {
      setIsLoading(true);
      const accessRights = await fetchUserAccessRights(userId);
      
      if (user) {
        setUser({
          ...user,
          accessRights
        });
      }
      
      // Set the first chatbot as default if available
      if (accessRights.chatbots.length > 0) {
        const defaultChatbotId = accessRights.chatbots[0].id;
        setCurrentChatbotId(defaultChatbotId);
        
        // Load the chatbot configuration
        const config = await fetchChatbotConfig(defaultChatbotId);
        setCurrentChatbotConfig(config);
      }
    } catch (error) {
      console.error('Error loading user access rights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load chatbot config when currentChatbotId changes
  useEffect(() => {
    const loadChatbotConfig = async () => {
      if (currentChatbotId) {
        try {
          setIsLoading(true);
          const config = await fetchChatbotConfig(currentChatbotId);
          setCurrentChatbotConfig(config);
        } catch (error) {
          console.error('Error loading chatbot config:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentChatbotConfig(null);
      }
    };

    loadChatbotConfig();
  }, [currentChatbotId]);

  const value = {
    user,
    setUser,
    chatHistory,
    addChatMessage,
    clearChatHistory,
    assignments,
    addAssignment,
    updateAssignment,
    notes,
    addNote,
    updateNote,
    learningMaterials,
    addLearningMaterial,
    languagePractices,
    addLanguagePractice,
    updateLanguagePractice,
    chatSessions,
    addChatSession,
    updateChatSession,
    deleteChatSession,
    currentChatbotId,
    setCurrentChatbotId,
    currentChatbotConfig,
    loadUserAccessRights,
    isLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};