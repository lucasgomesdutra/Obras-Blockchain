const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const DocumentoController = require('../controllers/documento.controller');
const { authenticateToken } = require('../middlewares/auth.middlewares');
const upload = require('../middlewares/upload.middlewares');

// Upload de documento
router.post('/upload', authenticateToken, upload.single('arquivo'), DocumentoController.upload);

// Listar documentos
router.get('/list', authenticateToken, DocumentoController.listar);

// Verificar integridade de documento
router.get('/verificar/:id', authenticateToken, DocumentoController.verificarIntegridade);

module.exports = router;