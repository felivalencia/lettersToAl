const express = require('express');
const router = express.Router();
const letterService = require('../services/letterService');
const authService = require('../services/authService');

// Authentication middleware
const authenticate = async (req, res, next) => {
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
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'An error occurred during authentication' });
  }
};

// Get all letters (public)
router.get('/', async (req, res) => {
  try {
    const letters = await letterService.getAllLetters();
    return res.status(200).json(letters);
  } catch (error) {
    console.error('Error getting letters:', error);
    return res.status(500).json({ error: 'An error occurred fetching letters' });
  }
});

// Get a letter by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const letter = await letterService.getLetterById(req.params.id);
    return res.status(200).json(letter);
  } catch (error) {
    console.error(`Error getting letter ${req.params.id}:`, error);
    return res.status(500).json({ error: 'An error occurred fetching the letter' });
  }
});

// Get letters by the authenticated user
router.get('/user/me', authenticate, async (req, res) => {
  try {
    const letters = await letterService.getLettersByUserId(req.user.id);
    return res.status(200).json(letters);
  } catch (error) {
    console.error('Error getting user letters:', error);
    return res.status(500).json({ error: 'An error occurred fetching your letters' });
  }
});

// Create a new letter
router.post('/', async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Letter content is required' });
    }
    
    // Check for authenticated user (optional for anonymous letters)
    let userId = null;
    if (!isAnonymous) {
      const token = req.cookies.auth_token;
      if (token) {
        const user = await authService.verifyToken(token);
        if (user) {
          userId = user.id;
        } else {
          return res.status(401).json({ error: 'Authentication required for non-anonymous letters' });
        }
      } else {
        return res.status(401).json({ error: 'Authentication required for non-anonymous letters' });
      }
    }
    
    // Create the letter
    const letter = await letterService.createLetter({
      content,
      isAnonymous: isAnonymous || !userId, // Default to anonymous if no user ID
      userId
    });
    
    return res.status(201).json(letter);
  } catch (error) {
    console.error('Error creating letter:', error);
    return res.status(500).json({ error: 'An error occurred creating the letter' });
  }
});

module.exports = router; 