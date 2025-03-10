import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/api/db.ts';

// Import route files
import userRoutes from './src/routes/userRoutes.ts';
import chatbotRoutes from './src/routes/chatbotRoutes.ts';
import chatSessionRoutes from './src/routes/chatSessionRoutes.ts';
import chatMessageRoutes from './src/routes/chatMessageRoutes.ts';
import apiTokenRoutes from './src/routes/apiTokenRoutes.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the test page
app.get('/test', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'test-api.html'));
});

// Test database connection
app.get('/api/test-db', async (_req: Request, res: Response) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      res.json({ message: 'Database connection successful' });
    } else {
      res.status(500).json({ message: 'Database connection failed' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing database connection', error: error.message });
  }
});

// Use route files
app.use('/api/users', userRoutes);
app.use('/api/chatbots', chatbotRoutes);
app.use('/api/chat/sessions', chatSessionRoutes);
app.use('/api/chat/messages', chatMessageRoutes);
app.use('/api/tokens', apiTokenRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test API page available at: http://localhost:${PORT}/test`);
});
