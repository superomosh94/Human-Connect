const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.session.user.id;

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Username must be at least 2 characters long.' });
        }

        await User.update(userId, username);

        // Update session
        req.session.user.username = username;
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

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(userId, hashedPassword);

        res.json({ success: true, message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update password.' });
    }
};
