const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register Routes
router.get('/register', authController.getRegister);
router.post('/auth/register', authController.postRegister);

// Login Routes
router.get('/login', authController.getLogin);
router.post('/auth/login', authController.postLogin);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
