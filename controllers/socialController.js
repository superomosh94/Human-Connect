const { query } = require('../database/config');
const { createNotification } = require('../utils/notifications');

exports.toggleLike = async (req, res) => {
    try {
        const { worldId } = req.body;
        const userId = req.session.user.id;

        // Check if already liked
        const existing = await query('SELECT id FROM likes WHERE user_id = ? AND world_id = ?', [userId, worldId]);

        if (existing.length > 0) {
            // Unlike
            await query('DELETE FROM likes WHERE id = ?', [existing[0].id]);
            return res.json({ success: true, liked: false, message: 'Unliked.' });
        } else {
            // Like
            await query('INSERT INTO likes (user_id, world_id) VALUES (?, ?)', [userId, worldId]);

            // Notify world owner
            const worlds = await query('SELECT user_id FROM shared_worlds WHERE id = ?', [worldId]);
            const world = worlds[0];
            if (world && world.user_id !== userId) {
                await createNotification({
                    userId: world.user_id,
                    type: 'like',
                    content: `${req.session.user.username} liked your Shared World!`,
                    link: '/community/shared-worlds'
                });
            }

            return res.json({ success: true, liked: true, message: 'Liked!' });
        }
    } catch (error) {
        console.error('Toggle Like Error:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle like.' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { worldId, content } = req.body;
        const userId = req.session.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Comment cannot be empty.' });
        }

        const result = await query('INSERT INTO comments (user_id, world_id, content) VALUES (?, ?, ?)', [userId, worldId, content]);

        // Notify world owner
        const worlds = await query('SELECT user_id FROM shared_worlds WHERE id = ?', [worldId]);
        const world = worlds[0];
        if (world && world.user_id !== userId) {
            await createNotification({
                userId: world.user_id,
                type: 'comment',
                content: `${req.session.user.username} commented on your Shared World!`,
                link: '/community/shared-worlds'
            });
        }

        res.json({
            success: true,
            message: 'Comment added.',
            comment: {
                id: result.insertId,
                username: req.session.user.username,
                content: content,
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('Add Comment Error:', error);
        res.status(500).json({ success: false, error: 'Failed to add comment.' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { worldId } = req.params;
        const sql = `
            SELECT c.*, u.username, u.avatar_url 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.world_id = ? 
            ORDER BY c.created_at ASC
        `;
        const comments = await query(sql, [worldId]);
        res.json({ success: true, comments });
    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch comments.' });
    }
};
