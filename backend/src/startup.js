const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Initialize environment variables from .env file
 */
function loadEnvironment() {
  // Find the .env file path
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  
  console.log('Checking for .env file at:', envPath);
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env file not found at', envPath);
    console.error('Please create a .env file with the required environment variables.');
    return false;
  }
  
  // Load the .env file
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('ERROR: Failed to load .env file:', result.error);
    return false;
  }
  
  // Check required variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('ERROR: Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    return false;
  }
  
  console.log('Environment loaded successfully');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
  
  return true;
}

module.exports = { loadEnvironment }; 