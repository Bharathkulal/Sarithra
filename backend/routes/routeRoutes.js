const express = require('express');
const router = express.Router();
const { findRoute, saveRoute, getHistory } = require('../controllers/routeController');

// Find route
router.post('/find', findRoute);

// Save route
router.post('/save', saveRoute);

// Get route history
router.get('/history', getHistory);

module.exports = router;
