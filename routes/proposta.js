const express = require('express');
const router = express.Router();
const PropostaController = require('../controllers/PropostaController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Enviar proposta (Empresa)
router.post(
  '/enviar',
  authenticateToken,
  [
    body('licitacao_id').notEmpty(),
    body('valor_proposta').isNumeric(),
    body('prazo_execucao').isInt()
  ],
  PropostaController.enviar
);

// Minhas propostas (Empresa)
router.get('/minhas', authenticateToken, PropostaController.listarMinhas);

module.exports = router;
