// Load environment variables first
import { loadEnvironment } from './startup';
const envLoaded = loadEnvironment();
if (!envLoaded) {
    console.warn('Starting with missing or invalid environment variables. Some functionality may not work.');
}

// Core Node.js modules
import path from 'path';

// External dependencies
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Local routes
import authRoutes from './routes/authRoutes';
import letterRoutes from './routes/letterRoutes';
import { errorHandler } from './utils/errorHandler';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];

// Primary CORS middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Additional CORS headers for browsers that need it
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Standard middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/letters', letterRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Letters to Al API is running'
    });
});

// Debugging route to verify server is responding
app.get('/api/debug', (req, res) => {
    res.status(200).json({
        message: 'API is working correctly',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT,
            frontendUrl: process.env.FRONTEND_URL,
            supabaseUrlExists: !!process.env.SUPABASE_URL,
            jwtSecretExists: !!process.env.JWT_SECRET
        }
    });
});

// Error handling middleware - using the centralized error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`✨ Letters to Al API running on port ${PORT}`);
}); 