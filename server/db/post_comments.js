// post_comments.js
import { prepare } from './db';

function addComment({ post_id, user_id, content, reference_id = null }) {
    const stmt = prepare(`
        INSERT INTO post_comments (post_id, user_id, content, reference_id)
        VALUES (?, ?, ?, ?)
    `);
    return stmt.run(post_id, user_id, content, reference_id).lastInsertRowid;
}

function getCommentsForPost(post_id) {
    return prepare(`
        SELECT * FROM post_comments
        WHERE post_id = ?
        ORDER BY created_at ASC
    `).all(post_id);
}

function deleteComment(comment_id) {
    const stmt = prepare(`DELETE FROM post_comments WHERE comment_id = ?`);
    return stmt.run(comment_id).changes > 0;
}

export default {
    addComment,
    getCommentsForPost,
    deleteComment
};
