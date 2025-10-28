const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const BlockchainService = require('../services/Blockchain');

const JWT_SECRET = process.env.JWT_SECRET || 'hackateen2025_secret_key_temporario_para_teste';

class AuthController {
  async register(req, res) {
    try {
      const { usuario, email, senha, tipo_usuario, empresa } = req.body;

      const existente = await Usuario.findOne({ $or: [{ usuario }, { email }] });
      if (existente)
        return res.status(400).json({ success: false, message: 'Usuário ou email já cadastrado' });

      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = await Usuario.create({
        usuario,
        email,
        senha: senhaHash,
        tipo_usuario,
        empresa: tipo_usuario === 'empresa' ? empresa : undefined
      });

      const hashBlockchain = await BlockchainService.criarTransacao('cadastro', novoUsuario._id.toString(), {
        usuario,
        tipo_usuario,
        timestamp: Date.now()
      });

      novoUsuario.hash_blockchain = hashBlockchain;
      await novoUsuario.save();

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { id: novoUsuario._id, hash_blockchain: hashBlockchain }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }

  async login(req, res) {
    try {
      const { usuario, senha } = req.body;

      const user = await Usuario.findOne({ $or: [{ usuario }, { email: usuario }] });
      if (!user || !user.ativo)
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

      const senhaOk = await bcrypt.compare(senha, user.senha);
      if (!senhaOk)
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

      const token = jwt.sign(
        { id: user._id, usuario: user.usuario, tipo_usuario: user.tipo_usuario },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user._id,
            usuario: user.usuario,
            email: user.email,
            tipo_usuario: user.tipo_usuario,
            empresa: user.empresa
          }
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new AuthController();
