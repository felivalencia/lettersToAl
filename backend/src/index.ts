// First, load environment variables
const { loadEnvironment } = require('./startup');
const envLoaded = loadEnvironment();
if (!envLoaded) {
    console.warn('Starting with missing or invalid environment variables. Some functionality may not work.');
}

// Then import everything else
import express from 'express';
import cors from 'cors';
import path from 'path';
import { lettersRoutes } from './routes/lettersRoutes';

// Import the auth routes and letter routes from JS files
const authRoutes = require('./routes/authRoutes');
const letterRoutes = require('./routes/letterRoutes');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional headers for better CORS handling
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/letters', letterRoutes); // Use the JS version of letter routes
// Add auth routes
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Something went wrong',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✨ Letters to Al API running on port ${PORT}`);
}); 