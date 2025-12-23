const { query } = require('../database/config');

exports.createNotification = async ({ userId, type, content, link }) => {
    try {
        await query(
            'INSERT INTO notifications (user_id, type, content, link) VALUES (?, ?, ?, ?)',
            [userId, type, content, link]
        );
        return true;
    } catch (error) {
        console.error('Create Notification Error:', error);
        return false;
    }
};
