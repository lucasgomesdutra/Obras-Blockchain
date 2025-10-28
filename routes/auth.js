const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth');
const { body } = require('express-validator');

// Registro
router.post(
  '/register',
  [
    body('usuario').isLength({ min: 3 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('senha').isLength({ min: 6 }),
    body('tipo_usuario').isIn(['cidadao', 'empresa', 'governo'])
  ],
  AuthController.register
);

// Login
router.post(
  '/login',
  [
    body('usuario').notEmpty(),
    body('senha').notEmpty()
  ],
  AuthController.login
);

module.exports = router;
