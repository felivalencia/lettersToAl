import { Router } from 'express';
import {
    createLetter,
    getLetterById,
    getLetterMap
} from '../controllers/lettersController';

const router = Router();

/**
 * @route   POST /api/letters
 * @desc    Create a new letter
 * @access  Public
 */
router.post('/', createLetter);

/**
 * @route   GET /api/letters/map
 * @desc    Get letter map data for visualization
 * @access  Public
 */
router.get('/map', getLetterMap);

/**
 * @route   GET /api/letters/:id
 * @desc    Get a single letter by ID
 * @access  Public
 */
router.get('/:id', getLetterById);

export { router as lettersRoutes }; 