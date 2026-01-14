// direct_messages.js
import { prepare } from './db';

function sendMessage({ sender_id, recipient_id, content }) {
    const stmt = prepare(`
        INSERT INTO direct_messages (sender_id, recipient_id, content)
        VALUES (?, ?, ?)
    `);
    return stmt.run(sender_id, recipient_id, content).lastInsertRowid;
}

function getMessagesBetweenUsers(user1_id, user2_id) {
    return prepare(`
        SELECT * FROM direct_messages
        WHERE (sender_id = ? AND recipient_id = ?)
           OR (sender_id = ? AND recipient_id = ?)
        ORDER BY sent_on ASC
    `).all(user1_id, user2_id, user2_id, user1_id);
}

function markAsRead(message_id) {
    const stmt = prepare(`UPDATE direct_messages SET read_on = CURRENT_TIMESTAMP WHERE message_id = ?`);
    return stmt.run(message_id).changes > 0;
}

export default {
    sendMessage,
    getMessagesBetweenUsers,
    markAsRead
};
