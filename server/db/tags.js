// tags.js
import { prepare } from './db';

function createTag(tag_label) {
    const stmt = prepare(`
        INSERT INTO tags (tag_label, tag_first_used, tag_last_used)
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(tag_label) DO NOTHING
    `);
    return stmt.run(tag_label).lastInsertRowid;
}

function getTagById(tag_id) {
    return prepare('SELECT * FROM tags WHERE tag_id = ?').get(tag_id);
}

function getTagByLabel(tag_label) {
    return prepare('SELECT * FROM tags WHERE tag_label = ?').get(tag_label);
}

function updateTagUsage(tag_id) {
    const stmt = prepare(`
        UPDATE tags
        SET tag_popularity = tag_popularity + 1,
            tag_last_used = CURRENT_TIMESTAMP
        WHERE tag_id = ?
    `);
    return stmt.run(tag_id).changes > 0;
}

export default {
    createTag,
    getTagById,
    getTagByLabel,
    updateTagUsage
};
