import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Provides consistent error responses across the API
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', err);

    // Determine status code - default to 500
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        error: 'Something went wrong',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

/**
 * Custom API error class for consistent error handling
 */
export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Catch async errors to avoid try/catch blocks in route handlers
 */
export function asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
} 