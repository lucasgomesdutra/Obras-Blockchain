const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const PropostaController = require('../controllers/proposta.controller');
const { authenticateToken, authorizeEmpresa, authorizeGoverno } = require('../middlewares/auth.middlewares');
const { body } = require('express-validator');

// Enviar proposta (Empresa)
router.post(
  '/enviar',
  authenticateToken,
  authorizeEmpresa,
  [
    body('licitacao_id').notEmpty(),
    body('valor_proposta').isNumeric(),
    body('prazo_execucao').isInt()
  ],
  handleValidationErrors,
  PropostaController.enviar
);

// Minhas propostas (Empresa)
router.get('/minhas', authenticateToken, authorizeEmpresa, PropostaController.listarMinhas);

// Ver propostas de uma licitação (Governo)
router.get('/licitacao/:id', authenticateToken, authorizeGoverno, PropostaController.listarPorLicitacao);

// Avaliar proposta (Governo)
router.post(
  '/avaliar/:id',
  authenticateToken,
  authorizeGoverno,
  [
    body('status').isIn(['classificada', 'vencedora', 'desclassificada'])
  ],
  PropostaController.avaliar
);

module.exports = router;