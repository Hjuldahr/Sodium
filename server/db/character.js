// characters.js
import db from './db';

function createCharacter({ character_label, species_id = null }) {
    const stmt = db.prepare(`
        INSERT INTO characters (character_label, species_id, character_first_used, character_last_used)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(character_label) DO NOTHING
    `);
    return stmt.run(character_label, species_id).lastInsertRowid;
}

function getCharacterById(character_id) {
    return db.prepare('SELECT * FROM characters WHERE character_id = ?').get(character_id);
}

function getCharacterByLabel(character_label) {
    return db.prepare('SELECT * FROM characters WHERE character_label = ?').get(character_label);
}

function updateCharacterUsage(character_id) {
    const stmt = db.prepare(`
        UPDATE characters
        SET character_popularity = character_popularity + 1,
            character_last_used = CURRENT_TIMESTAMP
        WHERE character_id = ?
    `);
    return stmt.run(character_id).changes > 0;
}

export default {
    createCharacter,
    getCharacterById,
    getCharacterByLabel,
    updateCharacterUsage
};
