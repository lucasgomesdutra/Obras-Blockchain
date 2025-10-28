const express = require('express');
const router = express.Router();
const DocumentoController = require('../controllers/Documento');
const { authenticateToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Upload de documento
router.post('/upload', authenticateToken, upload.single('arquivo'), DocumentoController.upload);

// Listar documentos
router.get('/list', authenticateToken, DocumentoController.listar);

module.exports = router;
