import express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as letterService from '../services/letterService';
import * as authService from '../services/authService';
import { AuthUser } from '../services/authService';

// Create an interface that extends Express Request
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const router = express.Router();

// Authentication middleware
const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await authService.verifyToken(token);

    if (!user) {
      res.clearCookie('auth_token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get all letters
router.get('/', async (req: Request, res: Response) => {
  try {
    const letters = await letterService.getAllLetters();
    res.json(letters);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch letters' });
  }
});

// Get letter by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const letter = await letterService.getLetterById(req.params.id);

    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    res.json(letter);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch letter' });
  }
});

// Create a new letter
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, emotion, color, location, isAnonymous } = req.body;

    // If letter is not anonymous, require authentication
    if (!isAnonymous) {
      const token = req.cookies.auth_token;

      if (!token) {
        return res.status(401).json({ error: 'Authentication required for non-anonymous letters' });
      }

      const user = await authService.verifyToken(token);

      if (!user) {
        res.clearCookie('auth_token');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = user;
    }

    const letter = await letterService.createLetter({
      content,
      emotion,
      color,
      location,
      userId: req.user?.id || null,
      isAnonymous: isAnonymous || !req.user?.id
    });

    res.status(201).json(letter);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create letter' });
  }
});

// Get letters by user ID (requires authentication)
router.get('/user/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const letters = await letterService.getLettersByUserId(req.user.id);
    res.json(letters);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user letters' });
  }
});

export default router; 