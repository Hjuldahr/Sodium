// post_characters.js
import { prepare } from './db';

function addCharacterToPost(post_id, character_id) {
    const stmt = prepare(`
        INSERT INTO post_characters (post_id, character_id)
        VALUES (?, ?)
        ON CONFLICT(post_id, character_id) DO NOTHING
    `);
    return stmt.run(post_id, character_id).changes > 0;
}

function removeCharacterFromPost(post_id, character_id) {
    const stmt = prepare(`DELETE FROM post_characters WHERE post_id = ? AND character_id = ?`);
    return stmt.run(post_id, character_id).changes > 0;
}

function getCharactersForPost(post_id) {
    return prepare(`
        SELECT c.* FROM characters c
        JOIN post_characters pc ON c.character_id = pc.character_id
        WHERE pc.post_id = ?
    `).all(post_id);
}

export default {
    addCharacterToPost,
    removeCharacterFromPost,
    getCharactersForPost
};
