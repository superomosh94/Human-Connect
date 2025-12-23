const { query } = require('../database/config');

exports.getDashboard = async (req, res) => {
    try {
        // Stats
        const userCount = await query('SELECT COUNT(*) as count FROM users');
        const worldCount = await query('SELECT COUNT(*) as count FROM shared_worlds');
        const loginToday = await query('SELECT COUNT(*) as count FROM users WHERE last_login >= CURDATE()');

        // Recent Users
        const recentUsers = await query('SELECT username, email, created_at, level FROM users ORDER BY created_at DESC LIMIT 10');

        // Content list
        const latestWorlds = await query(`
            SELECT sw.*, u.username 
            FROM shared_worlds sw 
            LEFT JOIN users u ON sw.user_id = u.id 
            ORDER BY sw.created_at DESC LIMIT 10
        `);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            page: 'admin',
            stats: {
                users: userCount[0].count,
                worlds: worldCount[0].count,
                activeToday: loginToday[0].count
            },
            recentUsers,
            latestWorlds,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteWorld = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM shared_worlds WHERE id = ?', [id]);
        res.json({ success: true, message: 'World deleted.' });
    } catch (error) {
        console.error('Delete World Error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete world.' });
    }
};
