// users.js
import { prepare } from './db';

// Create a user
function createUser({ user_name, user_email, user_password_hash, user_description, icon_post_id = null }) {
    const stmt = prepare(`
        INSERT INTO users (user_name, user_email, user_password_hash, user_description, icon_post_id)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(user_name, user_email, user_password_hash, user_description, icon_post_id);
    return info.lastInsertRowid;
}

// Get a user by ID
function getUserById(user_id) {
    return prepare('SELECT * FROM users WHERE user_id = ?').get(user_id);
}

// Get a user by email (for login)
function getUserByEmail(user_email) {
    return prepare('SELECT * FROM users WHERE user_email = ?').get(user_email);
}

// Update user fields
function updateUser(user_id, fields = {}) {
    const setParts = [];
    const values = [];
    for (const [key, value] of Object.entries(fields)) {
        setParts.push(`${key} = ?`);
        values.push(value);
    }
    if (setParts.length === 0) return false;

    const stmt = prepare(`UPDATE users SET ${setParts.join(', ')}, updated_on = CURRENT_TIMESTAMP WHERE user_id = ?`);
    const info = stmt.run(...values, user_id);
    return info.changes > 0;
}

// Soft-delete request
function requestDeletion(user_id) {
    const stmt = prepare(`
        UPDATE users
        SET deletion_requested_on = CURRENT_TIMESTAMP
        WHERE user_id = ?
    `);
    return stmt.run(user_id).changes > 0;
}

// Cancel deletion request
function cancelDeletion(user_id) {
    const stmt = prepare(`
        UPDATE users
        SET deletion_requested_on = NULL
        WHERE user_id = ?
    `);
    return stmt.run(user_id).changes > 0;
}

// Delete a user permanently (after grace period)
function deleteUser(user_id) {
    const stmt = prepare(`DELETE FROM users WHERE user_id = ?`);
    return stmt.run(user_id).changes > 0;
}

export default {
    createUser,
    getUserById,
    getUserByEmail,
    updateUser,
    requestDeletion,
    cancelDeletion,
    deleteUser
};
