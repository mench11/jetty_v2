import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/api/db.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      res.json({ message: 'Database connection successful' });
    } else {
      res.status(500).json({ message: 'Database connection failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error testing database connection', error: error.message });
  }
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.users.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.users.getById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const result = await db.users.create(req.body);
    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const result = await db.users.update(req.params.id, req.body);
    if (result.affectedRows > 0) {
      res.json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await db.users.delete(req.params.id);
    if (result.affectedRows > 0) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Chatbot routes
app.get('/api/chatbots', async (req, res) => {
  try {
    const chatbots = await db.chatbots.getAll();
    res.json(chatbots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chatbots', error: error.message });
  }
});

app.get('/api/chatbots/:id', async (req, res) => {
  try {
    const chatbot = await db.chatbots.getById(req.params.id);
    if (chatbot) {
      res.json(chatbot);
    } else {
      res.status(404).json({ message: 'Chatbot not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chatbot', error: error.message });
  }
});

app.post('/api/chatbots', async (req, res) => {
  try {
    const result = await db.chatbots.create(req.body);
    res.status(201).json({ message: 'Chatbot created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chatbot', error: error.message });
  }
});

app.put('/api/chatbots/:id', async (req, res) => {
  try {
    const result = await db.chatbots.update(req.params.id, req.body);
    if (result.affectedRows > 0) {
      res.json({ message: 'Chatbot updated successfully' });
    } else {
      res.status(404).json({ message: 'Chatbot not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating chatbot', error: error.message });
  }
});

app.delete('/api/chatbots/:id', async (req, res) => {
  try {
    const result = await db.chatbots.delete(req.params.id);
    if (result.affectedRows > 0) {
      res.json({ message: 'Chatbot deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chatbot not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chatbot', error: error.message });
  }
});

// Chat session routes
app.get('/api/chat/sessions', async (req, res) => {
  try {
    const userId = req.query.userId;
    const sessions = await db.chatSessions.getAll(userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat sessions', error: error.message });
  }
});

app.get('/api/chat/sessions/:id', async (req, res) => {
  try {
    const session = await db.chatSessions.getById(req.params.id);
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat session', error: error.message });
  }
});

app.post('/api/chat/sessions', async (req, res) => {
  try {
    const result = await db.chatSessions.create(req.body);
    res.status(201).json({ message: 'Chat session created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat session', error: error.message });
  }
});

app.put('/api/chat/sessions/:id', async (req, res) => {
  try {
    const result = await db.chatSessions.update(req.params.id, req.body);
    if (result.affectedRows > 0) {
      res.json({ message: 'Chat session updated successfully' });
    } else {
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating chat session', error: error.message });
  }
});

app.delete('/api/chat/sessions/:id', async (req, res) => {
  try {
    const result = await db.chatSessions.delete(req.params.id);
    if (result.affectedRows > 0) {
      res.json({ message: 'Chat session deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chat session', error: error.message });
  }
});

// Chat message routes
app.get('/api/chat/messages/:sessionId', async (req, res) => {
  try {
    const messages = await db.chatMessages.getAll(req.params.sessionId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
  }
});

app.post('/api/chat/messages', async (req, res) => {
  try {
    const result = await db.chatMessages.create(req.body);
    res.status(201).json({ message: 'Chat message created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat message', error: error.message });
  }
});

// API token routes
app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await db.apiTokens.getAll();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching API tokens', error: error.message });
  }
});

app.get('/api/tokens/:id', async (req, res) => {
  try {
    const token = await db.apiTokens.getById(req.params.id);
    if (token) {
      res.json(token);
    } else {
      res.status(404).json({ message: 'API token not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching API token', error: error.message });
  }
});

app.post('/api/tokens', async (req, res) => {
  try {
    const result = await db.apiTokens.create(req.body);
    res.status(201).json({ message: 'API token created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating API token', error: error.message });
  }
});

app.put('/api/tokens/:id', async (req, res) => {
  try {
    const result = await db.apiTokens.update(req.params.id, req.body);
    if (result.affectedRows > 0) {
      res.json({ message: 'API token updated successfully' });
    } else {
      res.status(404).json({ message: 'API token not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating API token', error: error.message });
  }
});

app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const result = await db.apiTokens.delete(req.params.id);
    if (result.affectedRows > 0) {
      res.json({ message: 'API token deleted successfully' });
    } else {
      res.status(404).json({ message: 'API token not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting API token', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
