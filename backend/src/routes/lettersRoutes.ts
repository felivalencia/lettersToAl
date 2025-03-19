import { Router } from 'express';
import {
    createLetter,
    getLetterById,
    getLetterMap,
    getAllLetters,
    updateUsernames
} from '../controllers/lettersController';

const router = Router();

/**
 * @route   POST /api/letters
 * @desc    Create a new letter
 * @access  Public
 */
router.post('/', createLetter);

/**
 * @route   GET /api/letters
 * @desc    Get all letters
 * @access  Public
 */
router.get('/', getAllLetters);

/**
 * @route   GET /api/letters/map
 * @desc    Get letter map data for visualization
 * @access  Public
 */
router.get('/map', getLetterMap);

/**
 * @route   POST /api/letters/update-usernames
 * @desc    Update username field for all non-anonymous letters (for testing)
 * @access  Public
 */
router.post('/update-usernames', updateUsernames);

/**
 * @route   GET /api/letters/:id
 * @desc    Get a single letter by ID
 * @access  Public
 */
router.get('/:id', getLetterById);

export { router as lettersRoutes }; 