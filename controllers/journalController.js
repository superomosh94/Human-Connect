const db = require('../database/config');
const challengeController = require('./challengeController');

exports.saveEntry = async (req, res) => {
    try {
        const { title, content, world_type, connection_score, quick_log } = req.body;
        const userId = req.session.user.id;

        await db.query(
            'INSERT INTO journal_entries (user_id, title, content, world_type, connection_score) VALUES (?, ?, ?, ?, ?)',
            [userId, title, content, world_type, connection_score]
        );

        if (quick_log) {
            // Award 20 XP for quick logging
            await db.query('UPDATE users SET xp_points = xp_points + 20 WHERE id = ?', [userId]);

            // Check for level up (500 XP per level)
            const userRows = await db.query('SELECT xp_points, level FROM users WHERE id = ?', [userId]);
            const user = userRows[0];
            const newLevel = Math.floor(user.xp_points / 500) + 1;
            if (newLevel > user.level) {
                await db.query('UPDATE users SET level = ? WHERE id = ?', [newLevel, userId]);
            }

            // Update challenge progress
            await challengeController.updateChallengeProgress(userId, 'journal');
        }

        res.json({ success: true, message: 'Journal entry saved successfully' });
    } catch (error) {
        console.error('Save Journal Error:', error);
        res.status(500).json({ error: 'Failed to save journal entry' });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const entries = await db.query(
            'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, entries });
    } catch (error) {
        console.error('Fetch Journal Error:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
};
