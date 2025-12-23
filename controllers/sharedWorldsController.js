const db = require('../database/config');

exports.shareSimulation = async (req, res) => {
    try {
        const { scenario_context, transcript, final_score } = req.body;
        const userId = req.session.user.id;

        // Anonymize by not storing sensitive user info in the transcript JSON if needed,
        // but the table has user_id for reference (can be filtered on fetch).

        await db.query(
            'INSERT INTO shared_worlds (user_id, scenario_context, transcript, final_score) VALUES (?, ?, ?, ?)',
            [userId, scenario_context, JSON.stringify(transcript), final_score]
        );

        res.json({ success: true, message: 'Simulation shared to the wall!' });
    } catch (error) {
        console.error('Share Simulation Error:', error);
        res.status(500).json({ error: 'Failed to share simulation' });
    }
};

exports.getSharedWorlds = async (req, res) => {
    try {
        const currentUserId = req.session.user ? req.session.user.id : 0;
        const worlds = await db.query(`
            SELECT 
                sw.*, 
                u.username,
                u.avatar_url,
                (SELECT COUNT(*) FROM likes WHERE world_id = sw.id) as like_count,
                (SELECT COUNT(*) FROM likes WHERE world_id = sw.id AND user_id = ?) as user_liked,
                (SELECT COUNT(*) FROM comments WHERE world_id = sw.id) as comment_count
            FROM shared_worlds sw
            LEFT JOIN users u ON sw.user_id = u.id
            ORDER BY sw.created_at DESC
            LIMIT 50
        `, [currentUserId]);

        res.json({ success: true, worlds });
    } catch (error) {
        console.error('Fetch Shared Worlds Error:', error);
        res.status(500).json({ error: 'Failed to fetch shared worlds' });
    }
};
