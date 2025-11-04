const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hackateen2025_secret_key_temporario_para_teste';

/**
 * Middleware para verificar se o token JWT é válido
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ success: false, message: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: 'Token inválido' });

    req.user = user;
    next();
  });
}

/**
 * Middleware: apenas usuários do governo
 */
function authorizeGoverno(req, res, next) {
  if (req.user.tipo_usuario !== 'governo') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a usuários governamentais'
    });
  }
  next();
}

/**
 * Middleware: apenas empresas
 */
function authorizeEmpresa(req, res, next) {
  if (req.user.tipo_usuario !== 'empresa') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a empresas'
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeGoverno,
  authorizeEmpresa
};
