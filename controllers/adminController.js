const User = require('../models/User');
const db = require('../database/config');

exports.getDashboard = async (req, res) => {
    try {
        const userCount = await db.query('SELECT COUNT(*) as count FROM users');
        const drillCount = await db.query('SELECT COUNT(*) as count FROM daily_drills WHERE completed = 1');
        const worldCount = await db.query('SELECT COUNT(*) as count FROM shared_worlds');

        const recentUsers = await db.query('SELECT username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5');

        const recentActivity = await db.query(`
            (SELECT 'Simulation' as activity_type, u.username, sm.created_at, sm.content as detail
             FROM simulation_messages sm
             JOIN users u ON sm.user_id = u.id
             WHERE sm.role = 'user'
             LIMIT 5)
            UNION ALL
            (SELECT 'Journal' as activity_type, u.username, je.created_at, je.title as detail
             FROM journal_entries je
             JOIN users u ON je.user_id = u.id
             LIMIT 5)
            ORDER BY created_at DESC
            LIMIT 10
        `);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            page: 'admin-dashboard',
            stats: {
                users: userCount[0].count,
                drills: drillCount[0].count,
                worlds: worldCount[0].count
            },
            recentUsers,
            recentActivity
        });
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).send('Admin Server Error');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const rows = await db.query('SELECT id, username, email, is_admin, level, xp_points, created_at FROM users ORDER BY created_at DESC');

        // Map is_admin to role for view compatibility
        const users = rows.map(u => ({
            ...u,
            role: u.is_admin ? 'admin' : 'user'
        }));

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
        const isAdminValue = role === 'admin' ? 1 : 0;
        await db.query('UPDATE users SET is_admin = ? WHERE id = ?', [isAdminValue, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- Tool Management ---
exports.createTool = async (req, res) => {
    try {
        const { tool_name, tool_type, description, formula, difficulty_level } = req.body;
        await db.query(
            'INSERT INTO conversation_tools (tool_name, tool_type, description, formula, difficulty_level) VALUES (?, ?, ?, ?, ?)',
            [tool_name, tool_type, description, formula, difficulty_level]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Create Tool Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateTool = async (req, res) => {
    try {
        const { id, tool_name, tool_type, description, formula, difficulty_level } = req.body;
        await db.query(
            'UPDATE conversation_tools SET tool_name = ?, tool_type = ?, description = ?, formula = ?, difficulty_level = ? WHERE id = ?',
            [tool_name, tool_type, description, formula, difficulty_level, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Update Tool Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteTool = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM conversation_tools WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Tool Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- Challenge Management ---
exports.getChallenges = async (req, res) => {
    try {
        const challenges = await db.query('SELECT * FROM challenges ORDER BY start_date DESC');
        res.render('admin/challenges', {
            title: 'Challenge Management',
            page: 'admin-challenges',
            challenges
        });
    } catch (err) {
        console.error('Admin Challenges Error:', err);
        res.status(500).send('Admin Server Error');
    }
};

exports.createChallenge = async (req, res) => {
    try {
        const { title, description, goal_type, goal_count, xp_reward, start_date, end_date } = req.body;
        await db.query(
            'INSERT INTO challenges (title, description, goal_type, goal_count, xp_reward, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, goal_type, goal_count, xp_reward, start_date, end_date, true]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Create Challenge Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateChallenge = async (req, res) => {
    try {
        const { id, title, description, goal_type, goal_count, xp_reward, start_date, end_date, is_active } = req.body;
        await db.query(
            'UPDATE challenges SET title = ?, description = ?, goal_type = ?, goal_count = ?, xp_reward = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?',
            [title, description, goal_type, goal_count, xp_reward, start_date, end_date, is_active, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Update Challenge Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM challenges WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Challenge Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
