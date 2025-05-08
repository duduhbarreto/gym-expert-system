const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Get user profile
router.get('/profile', controller.getProfile);

// Update user profile
router.put('/profile', controller.updateProfile);

// Change password
router.post('/change-password', controller.changePassword);

// Get user stats
router.get('/stats', controller.getStats);

module.exports = router;