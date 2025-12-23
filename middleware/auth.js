const express = require('express');

// Shared authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Please login to view this page');
    res.redirect('/login');
}

// API authentication middleware (returns JSON error instead of redirect)
function ensureAuthenticatedAPI(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please login.' });
}

// Admin authentication middleware
function ensureAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.is_admin) {
        return next();
    }
    req.flash('error', 'Unauthorized access. Admins only.');
    res.redirect('/dashboard');
}

module.exports = {
    ensureAuthenticated,
    ensureAuthenticatedAPI,
    ensureAdmin
};
