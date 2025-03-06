// Simulated database operations for client-side use
// In a real application, these operations would be performed on the server

// Simulated chatbot data
const chatbots = [
  {
    id: 'chatbot-1',
    name: '一般學習助手',
    model: 'gpt-4',
    daily_limit: 50,
    max_tokens: 4000,
    has_file_access: true,
    system_prompt: '你是一位專業的教育助手，能夠幫助學生理解複雜概念並提供學習建議。',
    knowledge_base: null,
    response_language: 'zh-TW',
    temperature: 0.7,
    emoji_mode: false,
    role: '教育助手',
    principles: '提供準確、清晰的解釋\n鼓勵批判性思考\n尊重不同學習風格',
    interaction_examples: '問：什麼是光合作用？\n答：光合作用是植物利用陽光能量將二氧化碳和水轉化為葡萄糖和氧氣的過程。',
    knowledge_base_enabled: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'chatbot-2',
    name: '數學專家',
    model: 'gpt-4',
    daily_limit: 30,
    max_tokens: 2000,
    has_file_access: false,
    system_prompt: '你是一位數學專家，專門解答數學問題並提供詳細的解題步驟。',
    knowledge_base: 'math-textbooks',
    response_language: 'zh-TW',
    temperature: 0.5,
    emoji_mode: false,
    role: '數學教師',
    principles: '提供詳細的解題步驟\n鼓勵學生理解概念而非死記公式\n使用多種方法解決問題',
    interaction_examples: '問：如何求解二次方程式？\n答：二次方程式ax²+bx+c=0的解可以使用公式x=(-b±√(b²-4ac))/2a求得。',
    knowledge_base_enabled: true,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  }
];

// Simulated database operations
export const simulateDbOperations = {
  getChatbots: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...chatbots];
  },
  
  getChatbotById: async (id: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return chatbots.find(chatbot => chatbot.id === id);
  },
  
  createChatbot: async (chatbot: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Add timestamps
    const newChatbot = {
      ...chatbot,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // In a real app, we would save to database
    chatbots.push(newChatbot);
    
    console.log('Creating chatbot:', newChatbot);
    return { insertId: Date.now() };
  },
  
  updateChatbot: async (id: string, updates: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the chatbot to update
    const index = chatbots.findIndex(chatbot => chatbot.id === id);
    
    if (index !== -1) {
      // Update the chatbot
      chatbots[index] = {
        ...chatbots[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
    
    console.log('Updating chatbot:', id, updates);
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  deleteChatbot: async (id: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Find the chatbot index
    const index = chatbots.findIndex(chatbot => chatbot.id === id);
    
    if (index !== -1) {
      // Remove the chatbot
      chatbots.splice(index, 1);
    }
    
    console.log('Deleting chatbot:', id);
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  // User access management
  getUserChatbotAccess: async (userId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // In a real app, we would query the database
    // For demo, return some mock data
    return chatbots.filter((_, index) => index < 2);
  },
  
  grantUserChatbotAccess: async (userId: string, chatbotId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Granting access: User ${userId} to chatbot ${chatbotId}`);
    return { affectedRows: 1 };
  },
  
  revokeUserChatbotAccess: async (userId: string, chatbotId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Revoking access: User ${userId} from chatbot ${chatbotId}`);
    return { affectedRows: 1 };
  },
  
  // Usage statistics
  getChatbotUsageStats: async (chatbotId: string, days = 30) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return mock statistics
    return {
      total_sessions: Math.floor(Math.random() * 1000),
      total_messages: Math.floor(Math.random() * 5000),
      avg_messages_per_session: Math.floor(Math.random() * 10) + 5,
      active_users: Math.floor(Math.random() * 100)
    };
  }
};

// Export the simulated operations
export default simulateDbOperations;