const { query } = require('../database/config');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const notifications = await query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;
        await query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read.' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const result = await query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
        res.json({ success: true, count: result[0].count });
    } catch (error) {
        console.error('Unread Count Error:', error);
        res.status(500).json({ success: false, error: 'Failed to get unread count.' });
    }
};
