import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jetty_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Generic query function
const query = async (sql: string, params: any[] = []) => {
  try {
    console.log('Executing SQL:', sql);
    console.log('With parameters:', JSON.stringify(params));
    const [results] = await pool.execute(sql, params);
    console.log('Query results:', JSON.stringify(results));
    return results;
  } catch (error) {
    console.error('Query error:', error);
    console.error('Failed SQL:', sql);
    console.error('Failed parameters:', JSON.stringify(params));
    throw error;
  }
};

// CRUD operations for users
export const userOperations = {
  getAll: async () => {
    return await query('SELECT id, email, name, user_type, created_at, updated_at, last_login, status FROM users');
  },
  
  getById: async (id: string) => {
    const users = await query('SELECT id, email, name, user_type, created_at, updated_at, last_login, status FROM users WHERE id = ?', [id]);
    return users[0] || null;
  },
  
  create: async (user: any) => {
    const { email, name, password_hash, user_type = 'free', status = 'active' } = user;
    
    // Generate a UUID for the new user
    const uuidResult = await query('SELECT UUID() as id') as any[];
    const id = uuidResult[0]?.id;
    
    console.log('Generated UUID for new user:', id);
    
    // Convert any undefined values to null for MySQL
    const params = [
      id, email, name, password_hash, user_type, status
    ].map(param => param === undefined ? null : param);
    
    console.log('User parameters:', JSON.stringify(params));
    
    const result = await query(
      'INSERT INTO users (id, email, name, password_hash, user_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      params
    ) as any;
    
    // Add the generated ID to the result
    if (result) {
      result.insertId = id;
    }
    
    return result;
  },
  
  update: async (id: string, updates: any) => {
    // Format the updated_at date properly for MySQL if it exists
    const updatesClone = { ...updates };
    
    // If updated_at is provided, format it to MySQL-compatible format
    if (updatesClone.updated_at) {
      try {
        // Convert ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
        const date = new Date(updatesClone.updated_at);
        updatesClone.updated_at = date.toISOString().slice(0, 19).replace('T', ' ');
      } catch (error) {
        console.error('Error formatting date:', error);
        // If date formatting fails, remove updated_at to let MySQL handle it
        delete updatesClone.updated_at;
      }
    }
    
    console.log('Formatted updates:', JSON.stringify(updatesClone));
    
    const fields = Object.keys(updatesClone).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updatesClone), id];
    
    const result = await query(`UPDATE users SET ${fields} WHERE id = ?`, values);
    return result;
  },
  
  delete: async (id: string) => {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    return result;
  }
};

// CRUD operations for chatbots
export const chatbotOperations = {
  getAll: async () => {
    return await query('SELECT * FROM chatbots');
  },
  
  getById: async (id: string) => {
    const chatbots = await query('SELECT * FROM chatbots WHERE id = ?', [id]);
    return chatbots[0] || null;
  },
  
  create: async (chatbot: any) => {
    const {
      name, model, provider = 'openai', daily_limit = 50, max_tokens = 4000,
      has_file_access = 0, system_prompt = null, welcome_message = null, knowledge_base = null,
      response_language = 'zh-TW', temperature = 0.7, emoji_mode = 0,
      role = null, principles = null, interaction_examples = null, status = 'active'
    } = chatbot;
    
    // Generate a UUID for the new chatbot
    const uuidResult = await query('SELECT UUID() as id') as any[];
    const id = uuidResult[0]?.id;
    
    console.log('Generated UUID for new chatbot:', id);
    
    // Convert any undefined values to null for MySQL
    const params = [
      id, name, model, provider, daily_limit, max_tokens, has_file_access,
      system_prompt, welcome_message, knowledge_base, response_language,
      temperature, emoji_mode, role, principles, interaction_examples, status
    ].map(param => param === undefined ? null : param);
    
    console.log('Chatbot parameters:', JSON.stringify(params));
    
    const result = await query(
      `INSERT INTO chatbots (
        id, name, model, provider, daily_limit, max_tokens, has_file_access,
        system_prompt, welcome_message, knowledge_base, response_language,
        temperature, emoji_mode, role, principles, interaction_examples, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    ) as any;
    
    // Add the generated ID to the result
    if (result) {
      result.insertId = id;
    }
    
    return result;
  },
  
  update: async (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await query(`UPDATE chatbots SET ${fields} WHERE id = ?`, values);
    return result;
  },
  
  delete: async (id: string) => {
    const result = await query('DELETE FROM chatbots WHERE id = ?', [id]);
    return result;
  }
};

// CRUD operations for chat sessions
export const chatSessionOperations = {
  getAll: async (userId?: string) => {
    let sql = 'SELECT * FROM chat_sessions';
    const params = [];
    
    if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    return await query(sql, params);
  },
  
  getById: async (id: string) => {
    const sessions = await query('SELECT * FROM chat_sessions WHERE id = ?', [id]);
    return sessions[0] || null;
  },
  
  create: async (session: any) => {
    const { user_id, chatbot_id, title, status = 'active', metadata = '{}' } = session;
    
    const result = await query(
      'INSERT INTO chat_sessions (user_id, chatbot_id, title, status, metadata) VALUES (?, ?, ?, ?, ?)',
      [user_id, chatbot_id, title, status, metadata]
    );
    
    return result;
  },
  
  update: async (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await query(`UPDATE chat_sessions SET ${fields} WHERE id = ?`, values);
    return result;
  },
  
  delete: async (id: string) => {
    const result = await query('DELETE FROM chat_sessions WHERE id = ?', [id]);
    return result;
  }
};

// CRUD operations for chat messages
export const chatMessageOperations = {
  getAll: async (sessionId: string) => {
    return await query('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC', [sessionId]);
  },
  
  create: async (message: any) => {
    const { session_id, role, content, metadata = '{}' } = message;
    
    const result = await query(
      'INSERT INTO chat_messages (session_id, role, content, metadata) VALUES (?, ?, ?, ?)',
      [session_id, role, content, metadata]
    );
    
    return result;
  },
  
  update: async (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await query(`UPDATE chat_messages SET ${fields} WHERE id = ?`, values);
    return result;
  },
  
  delete: async (id: string) => {
    const result = await query('DELETE FROM chat_messages WHERE id = ?', [id]);
    return result;
  }
};

// CRUD operations for API tokens
export const apiTokenOperations = {
  getAll: async () => {
    return await query('SELECT t.*, u.name as user_name, u.email as user_email FROM api_tokens t LEFT JOIN users u ON t.user_id = u.id');
  },
  
  getById: async (id: string) => {
    const tokens = await query('SELECT t.*, u.name as user_name, u.email as user_email FROM api_tokens t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?', [id]);
    return tokens[0] || null;
  },
  
  create: async (token: any) => {
    const { name, value, provider, status = 'active', user_id = null } = token;
    
    // Generate a UUID for the new token
    const uuidResult = await query('SELECT UUID() as id') as any[];
    const id = uuidResult[0]?.id;
    
    console.log('Generated UUID for new token:', id);
    
    const result = await query(
      'INSERT INTO api_tokens (id, name, value, provider, status, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, value, provider, status, user_id]
    ) as any;
    
    // Add the generated ID to the result
    if (result) {
      result.insertId = id;
    }
    
    return result;
  },
  
  update: async (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await query(`UPDATE api_tokens SET ${fields} WHERE id = ?`, values);
    return result;
  },
  
  delete: async (id: string) => {
    const result = await query('DELETE FROM api_tokens WHERE id = ?', [id]);
    return result;
  }
};

// Export the database operations
export default {
  testConnection,
  query,
  users: userOperations,
  chatbots: chatbotOperations,
  chatSessions: chatSessionOperations,
  chatMessages: chatMessageOperations,
  apiTokens: apiTokenOperations
};