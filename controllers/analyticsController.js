const db = require('../database/config');

exports.getProgressData = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;

        // 1. Fetch simulation scores over time
        const simScores = await db.query(`
            SELECT DATE(created_at) as date, AVG(score) as avg_score 
            FROM simulation_messages 
            WHERE user_id = ? AND role = 'ai' AND score IS NOT NULL
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        `, [userId]);

        // 2. Fetch journal scores over time
        const journalScores = await db.query(`
            SELECT DATE(created_at) as date, AVG(connection_score) as avg_score 
            FROM journal_entries 
            WHERE user_id = ? 
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        `, [userId]);

        // 3. Fetch tool usage frequency
        const toolUsage = await db.query(`
            SELECT ct.tool_name, COUNT(sm.id) as usage_count
            FROM conversation_tools ct
            JOIN simulation_messages sm ON sm.content LIKE CONCAT('%', ct.tool_name, '%')
            WHERE sm.user_id = ?
            GROUP BY ct.tool_name
        `, [userId]);

        // 4. Fetch achievements
        const earnedAchievements = await db.query(`
            SELECT a.*, ua.earned_at
            FROM achievements a
            JOIN user_achievements ua ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
        `, [userId]);

        res.json({
            success: true,
            simScores,
            journalScores,
            toolUsage,
            earnedAchievements
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch progress data' });
    }
};
