const User = require('../models/User');
const db = require('../database/config');

exports.getDashboard = async (req, res) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [drillCount] = await db.query('SELECT COUNT(*) as count FROM daily_drills WHERE completed = 1');
        const [worldCount] = await db.query('SELECT COUNT(*) as count FROM shared_worlds');

        const [recentUsers] = await db.query('SELECT username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5');

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            page: 'admin-dashboard',
            stats: {
                users: userCount.count,
                drills: drillCount.count,
                worlds: worldCount.count
            },
            recentUsers
        });
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).send('Admin Server Error');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await db.query('SELECT id, username, email, role, level, xp_points, created_at FROM users ORDER BY created_at DESC');
        res.render('admin/users', {
            title: 'User Management',
            page: 'admin-users',
            users
        });
    } catch (err) {
        console.error('Admin Users Error:', err);
        res.status(500).send('Admin Server Error');
    }
};

exports.getContent = async (req, res) => {
    try {
        const tools = await db.query('SELECT * FROM conversation_tools ORDER BY tool_type, tool_name');
        res.render('admin/content', {
            title: 'Content Management',
            page: 'admin-content',
            tools
        });
    } catch (err) {
        console.error('Admin Content Error:', err);
        res.status(500).send('Admin Server Error');
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
