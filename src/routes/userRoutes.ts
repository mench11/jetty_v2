import express from 'express';
import type { Request, Response } from 'express';
import db from '../api/db.ts';

// Define types for request parameters
interface UserIdParam {
  id: string;
}

// Define types for database results
interface DbResult {
  insertId?: number;
  affectedRows?: number;
}

const router = express.Router();

// Get all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await db.users.getAll();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req: Request<UserIdParam>, res: Response) => {
  try {
    const user = await db.users.getById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create user
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await db.users.create(req.body) as DbResult;
    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update user
router.put('/:id', async (req: Request<UserIdParam>, res: Response) => {
  try {
    const result = await db.users.update(req.params.id, req.body) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req: Request<UserIdParam>, res: Response) => {
  try {
    const result = await db.users.delete(req.params.id) as DbResult;
    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export { router as default };
