import * as jwt from 'jsonwebtoken';

// Secret key should be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'letters-to-al-secret-key';

// Token type definition
export interface TokenPayload {
    userId: string;
    username: string;
}

/**
 * Generate a JWT token for a user
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @returns {string} - JWT token
 */
export function generateToken(userId: string, username: string): string {
    return jwt.sign(
        { userId, username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {TokenPayload | null} - Token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

/**
 * Set auth cookie with JWT token
 * @param {object} res - Express response object
 * @param {string} token - JWT token
 */
export function setAuthCookie(res: any, token: string): void {
    // Cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    };

    res.cookie('auth_token', token, cookieOptions);
}

/**
 * Clear auth cookie
 * @param {object} res - Express response object
 */
export function clearAuthCookie(res: any): void {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });
} 