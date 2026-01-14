// genres.js
// Requires: npm install better-sqlite3
import Database from 'better-sqlite3';
import { resolve } from 'path';

const db = new Database(resolve(__dirname, 'app.db'));

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

export function addGenre(label) {
    const stmt = db.prepare(`
            INSERT OR IGNORE INTO genres (genre_label) 
            VALUES (?)
        `);
    stmt.run(label.toLowerCase());
}
export function incrementPopularity(genre_id) {
    const stmt = db.prepare(`
            UPDATE genres 
            SET genre_popularity = genre_popularity + 1,
                genre_last_used = CURRENT_TIMESTAMP
            WHERE genre_id = ?
        `);
    stmt.run(genre_id);
}
export function decrementPopularity(genre_id) {
    const stmt = db.prepare(`
            UPDATE genres 
            SET genre_popularity = MAX(genre_popularity - 1, 0)
            WHERE genre_id = ?
        `);
    stmt.run(genre_id);
}
export function getGenreByLabel(label) {
    const stmt = db.prepare(`SELECT * FROM genres WHERE genre_label = ?`);
    return stmt.get(label.toLowerCase());
}
export function getGenreById(genre_id) {
    const stmt = db.prepare(`SELECT * FROM genres WHERE genre_id = ?`);
    return stmt.get(genre_id);
}
export function listGenres(limit = 50) {
    const stmt = db.prepare(`
            SELECT * FROM genres
            ORDER BY genre_popularity DESC
            LIMIT ?
        `);
    return stmt.all(limit);
}