const User = require('../models/User');

exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('pages/settings', {
            title: 'Settings',
            page: 'settings',
            user: user
        });
    } catch (error) {
        console.error('Get Settings Error:', error);
        req.flash('error', 'Failed to load settings.');
        res.redirect('/dashboard');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, bio, avatar_url } = req.body;
        const userId = req.session.user.id;

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Username must be at least 2 characters long.' });
        }

        await User.updateProfile(userId, { username, bio, avatar_url });

        // Update session
        req.session.user.username = username;
        if (avatar_url) req.session.user.avatar_url = avatar_url;

        req.session.save(err => {
            if (err) console.error(err);
            res.json({ success: true, message: 'Profile updated successfully.' });
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile.' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
        }

        // Verify old password
        const user = await User.findById(userId);
        const isMatch = await User.verifyPassword(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Incorrect current password.' });
        }

        await User.updatePassword(userId, newPassword);

        res.json({ success: true, message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update password.' });
    }
};
