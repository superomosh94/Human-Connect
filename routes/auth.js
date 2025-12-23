const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Export authLimiter for use in app.js
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/logout', authController.logout);

module.exports = router;
