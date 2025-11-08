const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const BlockchainController = require('../controllers/blockchain.controller');
const { authenticateToken } = require('../middlewares/auth.middlewares');
const { body } = require('express-validator');

// Validar blockchain
router.get('/validar', authenticateToken, BlockchainController.validar);

// Verificar transação
router.post('/verificar', authenticateToken, [body('hash').notEmpty()], BlockchainController.verificar);

// Histórico da entidade (licitacao, proposta ou usuário)
router.get('/historico/:id', authenticateToken, BlockchainController.historico);

module.exports = router;
