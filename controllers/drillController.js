const db = require('../database/config');
const challengeController = require('./challengeController');

exports.getDailyDrill = async (req, res) => {
    try {
        // We use the current date (YYYY-MM-DD) as a seed or just pick one based on day of year
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

        const tools = await db.query('SELECT * FROM conversation_tools');
        if (tools.length === 0) return res.status(404).json({ error: 'No drills found' });

        // Pick a stable drill for the day
        const dailyDrill = tools[dayOfYear % tools.length];

        // Check if user already completed it today
        const userId = req.session.user.id;
        const today = new Date().toISOString().split('T')[0];
        const completion = await db.query(
            'SELECT * FROM daily_drills WHERE user_id = ? AND drill_date = ?',
            [userId, today]
        );

        res.json({
            success: true,
            drill: dailyDrill,
            completed: completion.length > 0
        });
    } catch (error) {
        console.error('Get Daily Drill Error:', error);
        res.status(500).json({ error: 'Failed to fetch daily drill' });
    }
};

exports.getAllDrills = async (req, res) => {
    try {
        const drills = await db.query('SELECT * FROM conversation_tools ORDER BY id ASC');
        res.json({ success: true, drills });
    } catch (error) {
        console.error('Get All Drills Error:', error);
        res.status(500).json({ error: 'Failed to fetch drills' });
    }
};

exports.completeDrill = async (req, res) => {
    try {
        const { drillId, notes } = req.body;
        const userId = req.session.user.id;
        const today = new Date().toISOString().split('T')[0];

        // Ensure not already completed today (prevent double XP)
        const existing = await db.query(
            'SELECT * FROM daily_drills WHERE user_id = ? AND drill_date = ?',
            [userId, today]
        );

        if (existing.length === 0) {
            await db.query(
                'INSERT INTO daily_drills (user_id, notes, drill_date, completed) VALUES (?, ?, ?, ?)',
                [userId, notes, today, true]
            );
            // Award XP (Mock)
            await db.query('UPDATE users SET xp_points = xp_points + 50 WHERE id = ?', [userId]);

            // Track challenge progress
            await challengeController.updateChallengeProgress(userId, 'drill');
        }

        res.json({ success: true, message: 'Drill completed!' });
    } catch (error) {
        console.error('Complete Drill Error:', error);
        res.status(500).json({ error: 'Failed to complete drill' });
    }
};
