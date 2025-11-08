const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const LicitacaoController = require('../controllers/licitacao.controller');
const { authenticateToken } = require('../middlewares/auth.middlewares');
const { body } = require('express-validator');

// Criar licitação (Governo)
router.post(
  '/create',
  authenticateToken,
  [
    body('titulo').notEmpty(),
    body('descricao').notEmpty(),
    body('objeto_licitacao').notEmpty(),
    body('modalidade').isIn(['pregao', 'concorrencia', 'tomada_preco', 'convite']),
    body('valor_estimado').isNumeric(),
    body('data_abertura').isISO8601(),
    body('data_fechamento').isISO8601()
  ],
  handleValidationErrors,
  LicitacaoController.create
);

// Listar licitações (todos)
router.get('/list', authenticateToken, LicitacaoController.list);

// Publicar licitação (Governo)
router.post('/publish/:id', authenticateToken, LicitacaoController.publish);

// Detalhes completos da licitação (Público)
router.get('/:id/detalhes', LicitacaoController.detalhes);

module.exports = router;