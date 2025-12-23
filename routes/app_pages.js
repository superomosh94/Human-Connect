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

// Simulator Page
router.get('/simulator', ensureAuthenticated, (req, res) => {
    res.render('pages/simulator', {
        title: 'World Builder Simulator',
        page: 'simulator',
        user: req.session.user
    });
});

// Journal Page
router.get('/journal', ensureAuthenticated, (req, res) => {
    res.render('pages/journal', {
        title: 'My Journal',
        page: 'journal',
        user: req.session.user
    });
});

// Profile Page (Redirect to Settings)
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.redirect('/settings');
});

// Daily Drill Page
router.get('/daily-drill', ensureAuthenticated, (req, res) => {
    res.render('pages/daily-drill', {
        title: 'Daily Training',
        page: 'Drill',
        user: req.session.user
    });
});

// Community Wall
router.get('/community/shared-worlds', ensureAuthenticated, (req, res) => {
    res.render('pages/shared-worlds', {
        title: 'Shared Worlds Wall',
        page: 'shared-worlds',
        user: req.session.user
    });
});

// Third Thing Playground
router.get('/playground/third-thing', ensureAuthenticated, (req, res) => {
    res.render('pages/third-thing', {
        title: 'Third Thing Generator',
        page: 'playground',
        user: req.session.user
    });
});

const userController = require('../controllers/userController');

// Settings Page
router.get('/settings', ensureAuthenticated, userController.getSettings);

// Notifications Page
router.get('/notifications', ensureAuthenticated, (req, res) => {
    res.render('pages/notifications', { title: 'Notifications', page: 'notifications', user: req.session.user });
});

module.exports = router;
