const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const TransparenciaController = require('../controllers/transparencia.controller');

// Dados públicos de transparência
router.get('/', TransparenciaController.resumo);

module.exports = router;
