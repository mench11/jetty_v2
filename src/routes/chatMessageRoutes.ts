import express from 'express';
import type { Request, Response } from 'express';
import db from '../api/db.ts';

// Define types for request parameters
interface SessionIdParam {
  sessionId: string;
}

// Define types for database results
interface DbResult {
  insertId?: number;
  affectedRows?: number;
}

const router = express.Router();

// Get all messages for a session
router.get('/:sessionId', async (req: Request<SessionIdParam>, res: Response) => {
  try {
    const messages = await db.chatMessages.getAll(req.params.sessionId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
  }
});

// Create message
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await db.chatMessages.create(req.body) as DbResult;
    res.status(201).json({ message: 'Chat message created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating chat message', error: error.message });
  }
});

export { router as default };
