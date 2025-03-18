import express, { Request, Response } from 'express';
import * as authService from '../services/authService';

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await authService.registerUser(username, email, password);

        // Set the auth token as a cookie
        res.cookie('auth_token', user.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await authService.loginUser(email, password);

        // Set the auth token as a cookie
        res.cookie('auth_token', user.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        res.status(401).json({ error: error.message || 'Authentication failed' });
    }
});

// Logout user
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
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

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error: any) {
        res.status(401).json({ error: error.message || 'Authentication failed' });
    }
});

// Check authentication status
router.get('/check', async (req: Request, res: Response) => {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.json({ authenticated: false });
        }

        const user = await authService.verifyToken(token);

        if (!user) {
            res.clearCookie('auth_token');
            return res.json({ authenticated: false });
        }

        res.json({
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.json({ authenticated: false });
    }
});

export default router; 