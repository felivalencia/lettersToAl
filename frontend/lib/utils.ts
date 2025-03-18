/**
 * Utility Functions
 * 
 * Common helper functions used throughout the frontend application.
 */

/**
 * Format a date into a friendly, human-readable string
 * @param {string|Date} date - The date to format
 * @param {Intl.DateTimeFormatOptions} options - Format options
 * @returns {string} - The formatted date string
 */
export function formatDate(
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a date as a relative time (e.g., "2 days ago", "just now")
 * @param {string|Date} date - The date to format
 * @returns {string} - The relative time string
 */
export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else {
        return formatDate(dateObj);
    }
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - The truncated string
 */
export function truncateString(str: string, maxLength: number = 100): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;

    return `${str.substring(0, maxLength)}...`;
}

/**
 * Convert a kebab-case or snake_case string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} - The camelCase string
 */
export function toCamelCase(str: string): string {
    return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (_, char) => char.toLowerCase());
}

/**
 * Safely access nested object properties without errors
 * @param {object} obj - The object to access
 * @param {string|string[]} path - The property path (e.g., 'user.address.city' or ['user', 'address', 'city'])
 * @param {any} defaultValue - The default value if the path is invalid
 * @returns {any} - The property value or the default value
 */
export function getNestedValue(obj: any, path: string | string[], defaultValue: any = undefined): any {
    const keys = Array.isArray(path) ? path : path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value === null || value === undefined || typeof value !== 'object') {
            return defaultValue;
        }

        value = value[key];
    }

    return value === undefined ? defaultValue : value;
}

/**
 * Debounce a function call
 * @param {Function} fn - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function (this: any, ...args: Parameters<T>): void {
        const context = this;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            fn.apply(context, args);
            timeout = null;
        }, wait);
    };
}

/**
 * Generate a random color in hex format
 * @returns {string} - A random hex color string
 */
export function randomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
} 