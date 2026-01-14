// blacklists.js
import { prepare } from './db';

const blacklistTables = {
    genre: 'user_genre_blacklist',
    tag: 'user_tag_blacklist',
    character: 'user_character_blacklist',
    author: 'user_author_blacklist',
    user: 'user_user_blacklist'
};

function addToBlacklist(user_id, type, target_id) {
    const table = blacklistTables[type];
    if (!table) throw new Error(`Unknown blacklist type: ${type}`);
    const idCol = type === 'user' ? 'other_user_id' : type === 'author' ? 'author_id' : type + '_id';
    const stmt = prepare(`INSERT INTO ${table} (user_id, ${idCol}) VALUES (?, ?) ON CONFLICT(user_id, ${idCol}) DO NOTHING`);
    return stmt.run(user_id, target_id).changes > 0;
}

function removeFromBlacklist(user_id, type, target_id) {
    const table = blacklistTables[type];
    if (!table) throw new Error(`Unknown blacklist type: ${type}`);
    const idCol = type === 'user' ? 'other_user_id' : type === 'author' ? 'author_id' : type + '_id';
    const stmt = prepare(`DELETE FROM ${table} WHERE user_id = ? AND ${idCol} = ?`);
    return stmt.run(user_id, target_id).changes > 0;
}

function getBlacklist(user_id, type) {
    const table = blacklistTables[type];
    if (!table) throw new Error(`Unknown blacklist type: ${type}`);
    const idCol = type === 'user' ? 'other_user_id' : type === 'author' ? 'author_id' : type + '_id';
    return prepare(`SELECT ${idCol} FROM ${table} WHERE user_id = ?`).all(user_id).map(r => r[idCol]);
}

export default {
    addToBlacklist,
    removeFromBlacklist,
    getBlacklist
};
