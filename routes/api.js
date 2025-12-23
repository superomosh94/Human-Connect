const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// Ensure auth middleware is applied in app.js or here
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

router.post('/simulate/chat', ensureAuthenticated, simulationController.getSimulationResponse);
router.get('/simulate/history', ensureAuthenticated, simulationController.getSimulationHistory);
router.post('/simulate/reset', ensureAuthenticated, simulationController.resetSimulation);

const journalController = require('../controllers/journalController');
router.post('/journal/save', ensureAuthenticated, journalController.saveEntry);
router.get('/journal/entries', ensureAuthenticated, journalController.getEntries);

const drillController = require('../controllers/drillController');
router.get('/drills/today', ensureAuthenticated, drillController.getDailyDrill);
router.get('/drills/all', ensureAuthenticated, drillController.getAllDrills);
router.post('/drills/complete', ensureAuthenticated, drillController.completeDrill);

const analyticsController = require('../controllers/analyticsController');
const sharedWorldsController = require('../controllers/sharedWorldsController');
const challengeController = require('../controllers/challengeController');
const thirdThingController = require('../controllers/thirdThingController');

router.get('/analytics/progress', ensureAuthenticated, analyticsController.getProgressData);

// Shared Worlds Wall
router.get('/shared-worlds/feed', ensureAuthenticated, sharedWorldsController.getSharedWorlds);
router.post('/shared-worlds/share', ensureAuthenticated, sharedWorldsController.shareSimulation);

// Challenges
router.get('/challenges/active', ensureAuthenticated, challengeController.getActiveChallenge);

// Third Thing Generator
router.post('/third-thing/generate', ensureAuthenticated, thirdThingController.generateStarters);

module.exports = router;
