const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to ensure user is admin
function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Access denied. Admin privileges required.');
    res.redirect('/dashboard');
}

// All admin routes use ensureAdmin
router.use(ensureAdmin);

// Admin Routes
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/content', adminController.getContent);
router.post('/users/update-role', adminController.updateUserRole);

// Tool Management
router.post('/content/tools', adminController.createTool);
router.put('/content/tools', adminController.updateTool);
router.delete('/content/tools/:id', adminController.deleteTool);

// Challenge Management
router.get('/challenges', adminController.getChallenges);
router.post('/challenges', adminController.createChallenge);
router.put('/challenges', adminController.updateChallenge);
router.delete('/challenges/:id', adminController.deleteChallenge);

module.exports = router;
