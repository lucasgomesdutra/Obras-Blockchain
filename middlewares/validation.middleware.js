const { validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Erro de validação',
      errors: errors.array().map(err => ({
        campo: err.path,
        mensagem: err.msg
      }))
    });
  }
  
  next();
}

module.exports = { handleValidationErrors };