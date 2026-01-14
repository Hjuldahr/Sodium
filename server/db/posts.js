// posts.js
import { prepare } from './db';

function createPost({ user_id, genre_id = null, title, description = '', thumbnail_image_url, image_url }) {
    const stmt = prepare(`
        INSERT INTO posts (user_id, genre_id, title, description, thumbnail_image_url, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(user_id, genre_id, title, description, thumbnail_image_url, image_url).lastInsertRowid;
}

function getPostById(post_id) {
    return prepare('SELECT * FROM posts WHERE post_id = ?').get(post_id);
}

function updatePost(post_id, fields = {}) {
    const setParts = [];
    const values = [];
    for (const [key, value] of Object.entries(fields)) {
        setParts.push(`${key} = ?`);
        values.push(value);
    }
    if (setParts.length === 0) return false;

    const stmt = prepare(`UPDATE posts SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE post_id = ?`);
    return stmt.run(...values, post_id).changes > 0;
}

function incrementVisits(post_id) {
    const stmt = prepare(`UPDATE posts SET visits = visits + 1, last_viewed = CURRENT_TIMESTAMP WHERE post_id = ?`);
    return stmt.run(post_id).changes > 0;
}

function incrementFavourites(post_id) {
    const stmt = prepare(`UPDATE posts SET favourites = favourites + 1 WHERE post_id = ?`);
    return stmt.run(post_id).changes > 0;
}

export default {
    createPost,
    getPostById,
    updatePost,
    incrementVisits,
    incrementFavourites
};
