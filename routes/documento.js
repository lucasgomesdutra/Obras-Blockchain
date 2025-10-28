const express = require('express');
const router = express.Router();
const DocumentoController = require('../controllers/DocumentoController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Upload de documento
router.post('/upload', authenticateToken, upload.single('arquivo'), DocumentoController.upload);

// Listar documentos
router.get('/list', authenticateToken, DocumentoController.listar);

module.exports = router;
