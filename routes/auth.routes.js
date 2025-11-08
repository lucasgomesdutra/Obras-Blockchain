const { handleValidationErrors } = require('../middlewares/validation.middleware');
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
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
  handleValidationErrors,
  AuthController.register
);

// Login
router.post(
  '/login',
  [
    body('usuario').notEmpty(),
    body('senha').notEmpty()
  ],
  handleValidationErrors,
  AuthController.login
);

module.exports = router;
