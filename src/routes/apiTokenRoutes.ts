import express from 'express';
import type { Request, Response } from 'express';
import db from '../api/db.ts';

// Define types for request parameters
interface TokenIdParam {
  id: string;
}

// Define types for database results
interface DbResult {
  insertId?: number;
  affectedRows?: number;
}

const router = express.Router();

// Get all API tokens
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tokens = await db.apiTokens.getAll();
    res.json(tokens);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching API tokens', error: error.message });
  }
});

// Get API token by ID
router.get('/:id', async (req: Request<TokenIdParam>, res: Response) => {
  try {
    const token = await db.apiTokens.getById(req.params.id);
    if (token) {
      res.json(token);
    } else {
      res.status(404).json({ message: 'API token not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching API token', error: error.message });
  }
});

// Create API token
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await db.apiTokens.create(req.body) as DbResult;
    res.status(201).json({ message: 'API token created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating API token', error: error.message });
  }
});

// Update API token
router.put('/:id', async (req: Request<TokenIdParam>, res: Response) => {
  try {
    const result = await db.apiTokens.update(req.params.id, req.body) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'API token updated successfully' });
    } else {
      res.status(404).json({ message: 'API token not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating API token', error: error.message });
  }
});

// Delete API token
router.delete('/:id', async (req: Request<TokenIdParam>, res: Response) => {
  try {
    const result = await db.apiTokens.delete(req.params.id) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'API token deleted successfully' });
    } else {
      res.status(404).json({ message: 'API token not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting API token', error: error.message });
  }
});

export { router as default };
