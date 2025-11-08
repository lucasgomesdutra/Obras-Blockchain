const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middlewares/auth.middlewares');

// Dashboard por tipo de usuário
router.get('/', authenticateToken, DashboardController.dashboard);

module.exports = router;
