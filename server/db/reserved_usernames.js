// reserved_usernames.js
import { prepare } from './db';

function reserveUsername(user_id, old_user_name) {
    const stmt = prepare(`
        INSERT INTO reserved_user_name (user_id, old_user_name)
        VALUES (?, ?)
        ON CONFLICT(user_id, old_user_name) DO NOTHING
    `);
    return stmt.run(user_id, old_user_name).changes > 0;
}

function isUsernameReserved(old_user_name) {
    return prepare(`
        SELECT * FROM reserved_user_name
        WHERE old_user_name = ?
    `).get(old_user_name) !== undefined;
}

function removeExpiredReservations(expireMinutes = 10080) { // default 1 week
    const stmt = prepare(`
        DELETE FROM reserved_user_name
        WHERE reserved_on <= datetime('now', ? || ' minutes')
    `);
    return stmt.run(-expireMinutes).changes;
}

export default {
    reserveUsername,
    isUsernameReserved,
    removeExpiredReservations
};
