const AuthService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const resultado = await AuthService.registrarUsuario(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const resultado = await AuthService.fazerLogin(req.body);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(401).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();