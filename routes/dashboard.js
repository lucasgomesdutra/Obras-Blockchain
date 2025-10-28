const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/Dashboard');
const { authenticateToken } = require('../middlewares/auth');

// Dashboard por tipo de usuário
router.get('/', authenticateToken, DashboardController.dashboard);

module.exports = router;
