import express from 'express';
import type { Request, Response } from 'express';
import db from '../api/db.ts';

// Define types for request parameters
interface SessionIdParam {
  id: string;
}

interface ChatSessionQuery {
  userId?: string;
}

// Define types for database results
interface DbResult {
  insertId?: number;
  affectedRows?: number;
}

const router = express.Router();

// Get all chat sessions
router.get('/', async (req: Request<{}, {}, {}, ChatSessionQuery>, res: Response) => {
  try {
    const userId = req.query.userId;
    const sessions = await db.chatSessions.getAll(userId);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching chat sessions', error: error.message });
  }
});

// Get chat session by ID
router.get('/:id', async (req: Request<SessionIdParam>, res: Response) => {
  try {
    const session = await db.chatSessions.getById(req.params.id);
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching chat session', error: error.message });
  }
});

// Create chat session
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await db.chatSessions.create(req.body) as DbResult;
    res.status(201).json({ message: 'Chat session created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating chat session', error: error.message });
  }
});

// Update chat session
router.put('/:id', async (req: Request<SessionIdParam>, res: Response) => {
  try {
    const result = await db.chatSessions.update(req.params.id, req.body) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'Chat session updated successfully' });
    } else {
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating chat session', error: error.message });
  }
});

// Delete chat session
router.delete('/:id', async (req: Request<SessionIdParam>, res: Response) => {
  try {
    const result = await db.chatSessions.delete(req.params.id) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'Chat session deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chat session not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting chat session', error: error.message });
  }
});

export { router as default };
