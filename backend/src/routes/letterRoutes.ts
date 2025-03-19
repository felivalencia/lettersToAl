import express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as letterService from '../services/letterService';
import * as authService from '../services/authService';
import { AuthUser } from '../services/authService';
import { updateUsernames } from '../controllers/lettersController';

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

// Get letters by current user
router.get('/user/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const letters = await letterService.getLettersByUserId(req.user.id);
        res.json(letters);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to fetch user letters' });
    }
});

// Find similar letters - place before /:id route to avoid conflict
router.get('/similar/:query', async (req: Request, res: Response) => {
    try {
        const query = req.params.query;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 0.5;

        console.log(`Finding similar letters for query: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);
        console.log(`Parameters: limit=${limit}, threshold=${threshold}`);

        // Validate parameters
        if (isNaN(limit) || limit < 1 || limit > 20) {
            return res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 20.' });
        }

        if (isNaN(threshold) || threshold < 0 || threshold > 1) {
            return res.status(400).json({ error: 'Invalid threshold parameter. Must be between 0 and 1.' });
        }

        // Find similar letters
        const similarLetters = await letterService.findSimilarLetters(query, limit, threshold);
        console.log(`Found ${similarLetters.length} similar letters`);

        res.json(similarLetters);
    } catch (error: any) {
        console.error('Error finding similar letters:', error);
        res.status(500).json({ error: error.message || 'Failed to find similar letters' });
    }
});

// Get letter by ID - this should come after other specific routes
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

// Add the update-usernames route
router.post('/update-usernames', updateUsernames);

export default router; 