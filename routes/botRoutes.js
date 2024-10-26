const express = require('express');
const { isOnline, getSchedule } = require('../bot/verplex');  // Added getSchedule import
const router = express.Router();

// Bot status route
router.get('/status', (req, res) => {
    res.json({ isOnline });
});



module.exports = router;
