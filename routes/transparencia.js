const express = require('express');
const router = express.Router();
const TransparenciaController = require('../controllers/Transparencia');

// Dados públicos de transparência
router.get('/', TransparenciaController.resumo);

module.exports = router;
