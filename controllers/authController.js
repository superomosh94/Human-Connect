const User = require('../models/User');

exports.getRegister = (req, res) => {
    res.render('pages/register', { title: 'Register', page: 'register' });
};

exports.postRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            req.flash('error', 'All fields are required');
            return res.redirect('/register');
        }

        // Check if user exists (handled by DB constraint, but good to check)
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            req.flash('error', 'Email already exists');
            return res.redirect('/register');
        }

        await User.create({ username, email, password });
        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('error', 'Username or Email already exists');
        } else {
            req.flash('error', 'Registration failed. Please try again.');
        }
        res.redirect('/register');
    }
};

exports.getLogin = (req, res) => {
    res.render('pages/login', { title: 'Login', page: 'login' });
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const isMatch = await User.verifyPassword(password, user.password_hash);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Set Session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            level: user.level,
            role: user.role
        };

        req.flash('success', `Welcome back, ${user.username}!`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login Error:', error);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect('/');
    });
};
