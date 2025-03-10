import express from 'express';
import type { Request, Response } from 'express';
import db from '../api/db.ts';

// Define types for request parameters
interface ChatbotIdParam {
  id: string;
}

// Define types for database results
interface DbResult {
  insertId?: number;
  affectedRows?: number;
}

const router = express.Router();

// Get all chatbots
router.get('/', async (_req: Request, res: Response) => {
  try {
    const chatbots = await db.chatbots.getAll();
    res.json(chatbots);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching chatbots', error: error.message });
  }
});

// Get chatbot by ID
router.get('/:id', async (req: Request<ChatbotIdParam>, res: Response) => {
  try {
    const chatbot = await db.chatbots.getById(req.params.id);
    if (chatbot) {
      res.json(chatbot);
    } else {
      res.status(404).json({ message: 'Chatbot not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching chatbot', error: error.message });
  }
});

// Create chatbot
router.post('/', async (req: Request<{}, any, any>, res: Response) => {
  try {
    console.log('POST /api/chatbots - Request body:', JSON.stringify(req.body));
    
    // Validate required fields
    const { name, model } = req.body;
    if (!name || !model) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        requiredFields: ['name', 'model'],
        receivedFields: Object.keys(req.body)
      });
    }
    
    const result = await db.chatbots.create(req.body) as DbResult;
    console.log('POST /api/chatbots - Database result:', JSON.stringify(result));
    res.status(201).json({ message: 'Chatbot created successfully', id: result.insertId });
  } catch (error: any) {
    console.error('POST /api/chatbots - Error:', error);
    res.status(500).json({ 
      message: 'Error creating chatbot', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Update chatbot
router.put('/:id', async (req: Request<ChatbotIdParam>, res: Response) => {
  try {
    const result = await db.chatbots.update(req.params.id, req.body) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'Chatbot updated successfully' });
    } else {
      res.status(404).json({ message: 'Chatbot not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating chatbot', error: error.message });
  }
});

// Delete chatbot
router.delete('/:id', async (req: Request<ChatbotIdParam>, res: Response) => {
  try {
    const result = await db.chatbots.delete(req.params.id) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'Chatbot deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chatbot not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting chatbot', error: error.message });
  }
});

export { router as default };
