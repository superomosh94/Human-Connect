const express = require('express');
const router = express.Router();

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Please login to view this page');
    res.redirect('/login');
}

const db = require('../database/config');

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Fetch user data for level/xp
        const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = {
            ...users[0],
            role: users[0].is_admin ? 'admin' : 'user'
        };

        // Fetch counts
        const drillCount = await db.query('SELECT COUNT(*) as count FROM daily_drills WHERE user_id = ? AND completed = 1', [userId]);
        const journalCount = await db.query('SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?', [userId]);
        const achievementCount = await db.query('SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?', [userId]);

        res.render('pages/dashboard', {
            title: 'Dashboard',
            page: 'dashboard',
            user: user,
            stats: {
                drills: drillCount[0].count,
                journal: journalCount[0].count,
                achievements: achievementCount[0].count
            }
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
