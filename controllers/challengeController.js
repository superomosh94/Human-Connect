const db = require('../database/config');

exports.getActiveChallenge = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.json({ success: false, error: 'User not logged in' });
        }
        const userId = req.session.user.id;

        // Find current active challenge
        const challenges = await db.query(
            'SELECT * FROM challenges WHERE is_active = TRUE AND CURDATE() BETWEEN start_date AND end_date LIMIT 1'
        );

        if (challenges.length === 0) {
            return res.json({ success: true, challenge: null });
        }

        const challenge = challenges[0];

        // Get user progress
        const progress = await db.query(
            'SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
            [userId, challenge.id]
        );

        let userProgress = progress.length > 0 ? progress[0] : { current_progress: 0, is_completed: false };

        res.json({ success: true, challenge, userProgress });
    } catch (error) {
        console.error('Fetch Challenge Error:', error);
        res.status(500).json({ error: 'Failed to fetch challenge' });
    }
};

// Internal utility to update progress
exports.updateChallengeProgress = async (userId, type) => {
    try {
        const challenges = await db.query(
            'SELECT * FROM challenges WHERE is_active = TRUE AND goal_type = ? AND CURDATE() BETWEEN start_date AND end_date LIMIT 1',
            [type]
        );

        if (challenges.length === 0) return;

        const challenge = challenges[0];

        // Get existing progress
        const progress = await db.query(
            'SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
            [userId, challenge.id]
        );

        if (progress.length > 0) {
            const current = progress[0];
            if (current.is_completed) return;

            const newProgress = current.current_progress + 1;
            const isCompleted = newProgress >= challenge.goal_count;

            await db.query(
                'UPDATE user_challenges SET current_progress = ?, is_completed = ?, earned_at = ? WHERE id = ?',
                [newProgress, isCompleted, isCompleted ? new Date() : null, current.id]
            );

            if (isCompleted) {
                // Award XP
                await db.query('UPDATE users SET xp_points = xp_points + ? WHERE id = ?', [challenge.xp_reward, userId]);
            }
        } else {
            const isCompleted = challenge.goal_count <= 1;
            await db.query(
                'INSERT INTO user_challenges (user_id, challenge_id, current_progress, is_completed, earned_at) VALUES (?, ?, ?, ?, ?)',
                [userId, challenge.id, 1, isCompleted, isCompleted ? new Date() : null]
            );

            if (isCompleted) {
                await db.query('UPDATE users SET xp_points = xp_points + ? WHERE id = ?', [challenge.xp_reward, userId]);
            }
        }
    } catch (err) {
        console.error('Update Challenge error:', err);
    }
};
