const express = require('express');
const router = express.Router();
const { ensureAuthenticatedAPI } = require('../middleware/auth');
const simulationController = require('../controllers/simulationController');

router.post('/simulate/chat', ensureAuthenticatedAPI, simulationController.getSimulationResponse);
router.get('/simulate/history', ensureAuthenticatedAPI, simulationController.getSimulationHistory);
router.post('/simulate/reset', ensureAuthenticatedAPI, simulationController.resetSimulation);

const journalController = require('../controllers/journalController');
router.post('/journal/save', ensureAuthenticatedAPI, journalController.saveEntry);
router.get('/journal/entries', ensureAuthenticatedAPI, journalController.getEntries);

const drillController = require('../controllers/drillController');
router.get('/drills/today', ensureAuthenticatedAPI, drillController.getDailyDrill);
router.get('/drills/all', ensureAuthenticatedAPI, drillController.getAllDrills);
router.post('/drills/complete', ensureAuthenticatedAPI, drillController.completeDrill);

const analyticsController = require('../controllers/analyticsController');
const sharedWorldsController = require('../controllers/sharedWorldsController');
const challengeController = require('../controllers/challengeController');
const thirdThingController = require('../controllers/thirdThingController');

router.get('/analytics/progress', ensureAuthenticatedAPI, analyticsController.getProgressData);

// Shared Worlds Wall
router.get('/shared-worlds/feed', ensureAuthenticatedAPI, sharedWorldsController.getSharedWorlds);
router.post('/shared-worlds/share', ensureAuthenticatedAPI, sharedWorldsController.shareSimulation);

// Challenges
router.get('/challenges/active', ensureAuthenticatedAPI, challengeController.getActiveChallenge);

// Third Thing Generator
router.post('/third-thing/generate', ensureAuthenticatedAPI, thirdThingController.generateStarters);

const notificationController = require('../controllers/notificationController');
router.get('/notifications', ensureAuthenticatedAPI, notificationController.getNotifications);
router.get('/notifications/unread-count', ensureAuthenticatedAPI, notificationController.getUnreadCount);
router.put('/notifications/:id/read', ensureAuthenticatedAPI, notificationController.markAsRead);

const socialController = require('../controllers/socialController');
router.post('/shared-worlds/like', ensureAuthenticatedAPI, socialController.toggleLike);
router.post('/shared-worlds/comment', ensureAuthenticatedAPI, socialController.addComment);
router.get('/shared-worlds/:worldId/comments', ensureAuthenticatedAPI, socialController.getComments);

const userController = require('../controllers/userController');
router.put('/user/profile', ensureAuthenticatedAPI, userController.updateProfile);
router.put('/user/password', ensureAuthenticatedAPI, userController.updatePassword);

module.exports = router;
