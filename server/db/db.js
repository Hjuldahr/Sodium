// db.js
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

const DB_FILE = join(__dirname, 'schema.db');
const SCHEMA_FILE = join(__dirname, 'schema.sql');

// Open the database
const db = new Database(DB_FILE, { verbose: console.log });

// Auto-run schema if file exists
function initializeDatabase() {
    if (!existsSync(SCHEMA_FILE)) {
        console.warn('schema.sql not found, skipping initialization.');
        return;
    }

    const schemaSQL = readFileSync(SCHEMA_FILE, 'utf-8');

    // Split the SQL script into statements
    const statements = schemaSQL
        .split(/;\s*$/m)          // split on semicolons at line end
        .map(s => s.trim())       // trim whitespace
        .filter(s => s.length);   // remove empty lines

    const transaction = db.transaction(() => {
        for (const stmt of statements) {
            db.prepare(stmt).run();
        }
    });

    transaction();
    console.log('Database initialized from schema.sql');
}

// Initialize DB at startup
initializeDatabase();

export default db;