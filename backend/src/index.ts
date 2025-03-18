// First, load environment variables
import { loadEnvironment } from './startup';
const envLoaded = loadEnvironment();
if (!envLoaded) {
    console.warn('Starting with missing or invalid environment variables. Some functionality may not work.');
}

// Then import everything else
import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import letterRoutes from './routes/letterRoutes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Additional headers for better CORS handling
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin === process.env.FRONTEND_URL || origin === 'http://localhost:3000')) {
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