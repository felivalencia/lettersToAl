/**
 * Database Migration Script
 * 
 * This script runs all SQL migration files in the database/migrations directory.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Check your .env file.');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
    // Path to migrations directory
    const migrationsDir = path.join(__dirname, '../../../database/migrations');

    try {
        // Ensure migrations directory exists
        if (!fs.existsSync(migrationsDir)) {
            console.error(`Migrations directory not found: ${migrationsDir}`);
            process.exit(1);
        }

        // Get all SQL files in the migrations directory
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure files are processed in order

        if (migrationFiles.length === 0) {
            console.log('No migration files found');
            return;
        }

        console.log(`Found ${migrationFiles.length} migration files`);

        // Process each migration file
        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            // Execute the SQL
            const { error } = await supabase.rpc('exec_sql', { sql });

            if (error) {
                console.error(`Error running migration ${file}:`, error);
                console.error('SQL was:', sql);
                // Continue with next migration
            } else {
                console.log(`Successfully ran migration: ${file}`);
            }
        }

        console.log('All migrations completed');
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

// Run the migrations
runMigrations()
    .then(() => {
        console.log('Migration process completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration process failed:', error);
        process.exit(1);
    }); 