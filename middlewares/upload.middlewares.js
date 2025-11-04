const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Configuração do Multer para upload de arquivos
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = './uploads/';
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite: 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não permitido'));
  }
});

module.exports = upload;
