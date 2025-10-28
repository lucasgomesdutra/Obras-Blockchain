const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Dashboard por tipo de usuário
router.get('/', authenticateToken, DashboardController.dashboard);

module.exports = router;
