// genres.js
import { prepare } from './db';

function createGenre(genre_label) {
    const stmt = prepare(`
        INSERT INTO genres (genre_label, genre_first_used, genre_last_used)
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(genre_label) DO NOTHING
    `);
    return stmt.run(genre_label).lastInsertRowid;
}

function getGenreById(genre_id) {
    return prepare('SELECT * FROM genres WHERE genre_id = ?').get(genre_id);
}

function getGenreByLabel(genre_label) {
    return prepare('SELECT * FROM genres WHERE genre_label = ?').get(genre_label);
}

function updateGenreUsage(genre_id) {
    const stmt = prepare(`
        UPDATE genres
        SET genre_popularity = genre_popularity + 1,
            genre_last_used = CURRENT_TIMESTAMP
        WHERE genre_id = ?
    `);
    return stmt.run(genre_id).changes > 0;
}

export default {
    createGenre,
    getGenreById,
    getGenreByLabel,
    updateGenreUsage
};
