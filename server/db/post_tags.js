// post_tags.js
import { prepare } from './db';

function addTagToPost(post_id, tag_id) {
    const stmt = prepare(`
        INSERT INTO post_tags (post_id, tag_id)
        VALUES (?, ?)
        ON CONFLICT(post_id, tag_id) DO NOTHING
    `);
    return stmt.run(post_id, tag_id).changes > 0;
}

function removeTagFromPost(post_id, tag_id) {
    const stmt = prepare(`DELETE FROM post_tags WHERE post_id = ? AND tag_id = ?`);
    return stmt.run(post_id, tag_id).changes > 0;
}

function getTagsForPost(post_id) {
    return prepare(`
        SELECT t.* FROM tags t
        JOIN post_tags pt ON t.tag_id = pt.tag_id
        WHERE pt.post_id = ?
    `).all(post_id);
}

export default {
    addTagToPost,
    removeTagFromPost,
    getTagsForPost
};
