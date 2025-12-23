const express = require('express');
const router = express.Router();

// Home Page
router.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'Home',
        page: 'home'
    });
});

module.exports = router;
