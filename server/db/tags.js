// genres.js
// Requires: npm install better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'app.db'));

// Initialize table if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS genres (
    genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre_label TEXT NOT NULL UNIQUE,
    genre_popularity INTEGER DEFAULT 0,
    genre_shunning INTEGER DEFAULT 0,
    genre_first_used DATETIME DEFAULT CURRENT_TIMESTAMP,
    genre_last_used DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_genre_label ON genres(genre_label);
`);

module.exports = {
    /**
     * Add a new genre or ignore if it exists.
     * @param {string} label 
     */
    addGenre(label) {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO genres (genre_label) 
            VALUES (?)
        `);
        stmt.run(label.toLowerCase());
    },

    /**
     * Increment the popularity counter
     * @param {number} genre_id 
     */
    incrementPopularity(genre_id) {
        const stmt = db.prepare(`
            UPDATE genres 
            SET genre_popularity = genre_popularity + 1,
                genre_last_used = CURRENT_TIMESTAMP
            WHERE genre_id = ?
        `);
        stmt.run(genre_id);
    },

    /**
     * Decrement popularity (optional)
     * @param {number} genre_id 
     */
    decrementPopularity(genre_id) {
        const stmt = db.prepare(`
            UPDATE genres 
            SET genre_popularity = MAX(genre_popularity - 1, 0)
            WHERE genre_id = ?
        `);
        stmt.run(genre_id);
    },

    /**
     * Fetch genre by label
     * @param {string} label 
     * @returns genre row or undefined
     */
    getGenreByLabel(label) {
        const stmt = db.prepare(`SELECT * FROM genres WHERE genre_label = ?`);
        return stmt.get(label.toLowerCase());
    },

    /**
     * Fetch genre by ID
     * @param {number} genre_id 
     */
    getGenreById(genre_id) {
        const stmt = db.prepare(`SELECT * FROM genres WHERE genre_id = ?`);
        return stmt.get(genre_id);
    },

    /**
     * List all genres ordered by popularity descending
     */
    listGenres(limit = 50) {
        const stmt = db.prepare(`
            SELECT * FROM genres
            ORDER BY genre_popularity DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }
};