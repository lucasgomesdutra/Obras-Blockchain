const Usuario = require('../models/usuario.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const BlockchainService = require('./blockchain.services');

const JWT_SECRET = process.env.JWT_SECRET || 'hackateen2025_secret_key_temporario_para_teste';

class AuthService {
  async registrarUsuario(dados) {
    // Verificar se usuário já existe
    const existente = await Usuario.findOne({ 
      $or: [{ usuario: dados.usuario }, { email: dados.email }] 
    });
    
    if (existente) {
      throw new Error('Usuário ou email já cadastrado');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    // Criar usuário
    const novoUsuario = await Usuario.create({
      usuario: dados.usuario,
      email: dados.email,
      senha: senhaHash,
      tipo_usuario: dados.tipo_usuario,
      empresa: dados.tipo_usuario === 'empresa' ? dados.empresa : undefined
    });

    // Registrar no blockchain
    const hashBlockchain = await BlockchainService.criarTransacao(
      'cadastro', 
      novoUsuario._id.toString(), 
      {
        usuario: dados.usuario,
        tipo_usuario: dados.tipo_usuario,
        timestamp: Date.now()
      }
    );

    novoUsuario.hash_blockchain = hashBlockchain;
    await novoUsuario.save();

    return { id: novoUsuario._id, hash_blockchain: hashBlockchain };
  }

  async fazerLogin(credenciais) {
    // Buscar usuário
    const user = await Usuario.findOne({ 
      $or: [
        { usuario: credenciais.usuario }, 
        { email: credenciais.usuario }
      ] 
    });

    if (!user || !user.ativo) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const senhaOk = await bcrypt.compare(credenciais.senha, user.senha);
    if (!senhaOk) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token
    const token = jwt.sign(
      { 
        id: user._id, 
        usuario: user.usuario, 
        tipo_usuario: user.tipo_usuario 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        usuario: user.usuario,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        empresa: user.empresa
      }
    };
  }
}

module.exports = new AuthService();