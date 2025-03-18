/**
 * Application Configuration
 * 
 * Centralizes all environment variables and configuration settings
 * with validation and sensible defaults.
 */

// Define the structure of our configuration
interface Config {
    // Server configuration
    server: {
        port: number;
        nodeEnv: string;
        isDevelopment: boolean;
        isProduction: boolean;
        isTest: boolean;
    };

    // CORS configuration
    cors: {
        allowedOrigins: string[];
    };

    // Auth configuration
    auth: {
        jwtSecret: string;
        cookieSecure: boolean;
        cookieSameSite: boolean | 'none' | 'lax' | 'strict';
        cookieMaxAge: number;
    };

    // Database configuration
    database: {
        supabaseUrl: string;
        supabaseKey: string;
    };
}

/**
 * Get value from environment with validation
 */
function env(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;

    if (value === undefined) {
        console.warn(`Environment variable ${key} is not set`);
    }

    return value || '';
}

/**
 * Create application configuration
 */
export function createConfig(): Config {
    const nodeEnv = env('NODE_ENV', 'development');

    return {
        server: {
            port: parseInt(env('PORT', '3001'), 10),
            nodeEnv,
            isDevelopment: nodeEnv === 'development',
            isProduction: nodeEnv === 'production',
            isTest: nodeEnv === 'test',
        },

        cors: {
            allowedOrigins: [
                env('FRONTEND_URL', 'http://localhost:3000')
            ],
        },

        auth: {
            jwtSecret: env('JWT_SECRET', 'letters-to-al-secret-key'),
            cookieSecure: nodeEnv === 'production',
            cookieSameSite: nodeEnv === 'production' ? 'none' : 'lax',
            cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },

        database: {
            supabaseUrl: env('SUPABASE_URL', ''),
            supabaseKey: env('SUPABASE_SERVICE_KEY', ''),
        }
    };
}

// Export a singleton instance of the config
export const config = createConfig();

// Export the Config type for use elsewhere
export type { Config }; 