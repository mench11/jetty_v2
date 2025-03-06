import OpenAI from 'openai';
import { getActiveTokenByProvider } from './tokenManagement';
import { createDeepSeekClient, generateDeepSeekResponse } from './deepseek';

// Initialize OpenAI client with a placeholder API key
// The actual key will be retrieved from token management
let openai = new OpenAI({
  apiKey: 'placeholder-key',
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// Function to update the OpenAI client with a new API key
export const updateOpenAIClient = (apiKey: string) => {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Only for demo purposes
  });
};

// Initialize the OpenAI client with the active token on app start
(async () => {
  try {
    const activeToken = await getActiveTokenByProvider('openai');
    if (activeToken) {
      updateOpenAIClient(activeToken.value);
    }
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
  }
})();

export const generateChatResponse = async (
  messages: Array<{ role: string, content: string }>, 
  model = 'gpt-4',
  provider = 'openai'
) => {
  try {
    // Get the active token for the specified provider
    const activeToken = await getActiveTokenByProvider(provider as 'openai' | 'deepseek' | 'other');
    
    if (!activeToken) {
      throw new Error(`No active token found for provider: ${provider}`);
    }
    
    // Use the appropriate API based on the provider
    if (provider === 'openai') {
      // Update the OpenAI client with the active token
      updateOpenAIClient(activeToken.value);
      
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content;
    } else if (provider === 'deepseek') {
      // Use DeepSeek API
      return await generateDeepSeekResponse(
        activeToken.value,
        messages.map(msg => ({ role: msg.role as 'user' | 'assistant' | 'system', content: msg.content })),
        model,
        0.7,
        2000
      );
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

export const evaluateAssignment = async (assignment: string, criteria: string) => {
  try {
    // Get the active OpenAI token
    const activeToken = await getActiveTokenByProvider('openai');
    
    if (!activeToken) {
      throw new Error('No active OpenAI token found');
    }
    
    // Update the OpenAI client with the active token
    updateOpenAIClient(activeToken.value);
    
    const prompt = `
      Please evaluate the following assignment based on these criteria:
      ${criteria}
      
      Assignment:
      ${assignment}
      
      Provide a detailed evaluation including:
      1. Overall score (out of 100)
      2. Strengths
      3. Areas for improvement
      4. Specific feedback on content, structure, and accuracy
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error evaluating assignment:', error);
    throw error;
  }
};

export const generateLearningMaterial = async (
  subject: string,
  topic: string,
  difficulty: string,
  learningStyle: string
) => {
  try {
    // Get the active OpenAI token
    const activeToken = await getActiveTokenByProvider('openai');
    
    if (!activeToken) {
      throw new Error('No active OpenAI token found');
    }
    
    // Update the OpenAI client with the active token
    updateOpenAIClient(activeToken.value);
    
    const prompt = `
      Create learning material for:
      Subject: ${subject}
      Topic: ${topic}
      Difficulty: ${difficulty}
      Learning Style: ${learningStyle}
      
      Include:
      1. A clear explanation of the concept
      2. Examples that illustrate the concept
      3. Practice exercises with varying difficulty
      4. Visual aids or diagrams if appropriate
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating learning material:', error);
    throw error;
  }
};

export const enhanceNotes = async (notes: string) => {
  try {
    // Get the active OpenAI token
    const activeToken = await getActiveTokenByProvider('openai');
    
    if (!activeToken) {
      throw new Error('No active OpenAI token found');
    }
    
    // Update the OpenAI client with the active token
    updateOpenAIClient(activeToken.value);
    
    const prompt = `
      Enhance the following study notes:
      ${notes}
      
      Please provide:
      1. A concise summary of the main points
      2. A list of key concepts and their definitions
      3. Related concepts or additional information that might be helpful
      4. 5-10 review questions based on the content
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error enhancing notes:', error);
    throw error;
  }
};

export const practiceLanguage = async (
  language: string,
  level: string,
  userMessage: string
) => {
  try {
    // Get the active OpenAI token
    const activeToken = await getActiveTokenByProvider('openai');
    
    if (!activeToken) {
      throw new Error('No active OpenAI token found');
    }
    
    // Update the OpenAI client with the active token
    updateOpenAIClient(activeToken.value);
    
    const prompt = `
      You are a language tutor for ${language} at ${level} level.
      
      The student says: "${userMessage}"
      
      Please:
      1. Respond naturally to continue the conversation
      2. Correct any grammar or vocabulary mistakes
      3. Suggest alternative phrases or expressions if appropriate
      4. Keep your response encouraging and helpful
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in language practice:', error);
    throw error;
  }
};

// New API functions for dashboard integration
export const fetchUserAccessRights = async (userId: string) => {
  // In a real application, this would fetch from your backend
  // For demo purposes, we're returning mock data
  return {
    chatbots: [
      {
        id: 'chatbot-1',
        name: '一般學習助手',
        model: 'gpt-4',
        dailyLimit: 50,
        maxTokens: 4000,
        hasFileAccess: true,
        systemPrompt: '你是一位專業的教育助手，能夠幫助學生理解複雜概念並提供學習建議。'
      },
      {
        id: 'chatbot-2',
        name: '數學專家',
        model: 'gpt-4',
        dailyLimit: 30,
        maxTokens: 2000,
        hasFileAccess: false,
        systemPrompt: '你是一位數學專家，專門解答數學問題並提供詳細的解題步驟。'
      },
      {
        id: 'chatbot-3',
        name: 'DeepSeek 助手',
        model: 'deepseek-chat',
        dailyLimit: 50,
        maxTokens: 4000,
        hasFileAccess: true,
        systemPrompt: '你是一位由 DeepSeek 提供支持的 AI 助手，能夠幫助學生解決各種問題。'
      }
    ],
    accessExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    userType: 'premium'
  };
};

export const fetchChatbotConfig = async (chatbotId: string) => {
  // In a real application, this would fetch from your backend
  // For demo purposes, we're returning mock data based on the ID
  const chatbots = {
    'chatbot-1': {
      id: 'chatbot-1',
      name: '一般學習助手',
      model: 'gpt-4',
      provider: 'openai',
      dailyLimit: 50,
      maxTokens: 4000,
      hasFileAccess: true,
      welcomeMessage: '你好！我是你的學習助手，有什麼我可以幫助你的嗎？',
      systemPrompt: '你是一位專業的教育助手，能夠幫助學生理解複雜概念並提供學習建議。',
      knowledgeBase: null
    },
    'chatbot-2': {
      id: 'chatbot-2',
      name: '數學專家',
      model: 'gpt-4',
      provider: 'openai',
      dailyLimit: 30,
      maxTokens: 2000,
      hasFileAccess: false,
      welcomeMessage: '你好！我是數學專家，可以幫你解決各種數學問題。',
      systemPrompt: '你是一位數學專家，專門解答數學問題並提供詳細的解題步驟。',
      knowledgeBase: 'math-textbooks'
    },
    'chatbot-3': {
      id: 'chatbot-3',
      name: 'DeepSeek 助手',
      model: 'deepseek-chat',
      provider: 'deepseek',
      dailyLimit: 50,
      maxTokens: 4000,
      hasFileAccess: true,
      welcomeMessage: '你好！我是由 DeepSeek 提供支持的 AI 助手，有什麼我可以幫助你的嗎？',
      systemPrompt: '你是一位由 DeepSeek 提供支持的 AI 助手，能夠幫助學生解決各種問題。',
      knowledgeBase: null
    }
  };
  
  return chatbots[chatbotId] || chatbots['chatbot-1'];
};

export const logChatUsage = async (userId: string, chatbotId: string, messageCount: number, tokens: number) => {
  // In a real application, this would send usage data to your backend
  console.log(`Logging usage: User ${userId} used ${chatbotId} - ${messageCount} messages, ${tokens} tokens`);
  return true;
};