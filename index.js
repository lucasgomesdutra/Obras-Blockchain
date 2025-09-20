// Projeto: Obras&Blockchain

// Configurações Iniciais
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { setupSwagger, updateSwaggerInfo } = require('./swagger-setup');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET 

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Schemas do MongoDB
const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo_usuario: { 
    type: String, 
    enum: ['cidadao', 'empresa', 'governo'], 
    required: true 
  },
  
  empresa: {
    cnpj: String,
    razao_social: String,
    telefone: String,
    endereco: String
  },
  ativo: { type: Boolean, default: true },
  data_cadastro: { type: Date, default: Date.now },
  hash_blockchain: String
});

const licitacaoSchema = new mongoose.Schema({
  numero_edital: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  objeto_licitacao: { type: String, required: true },
  modalidade: {
    type: String,
    enum: ['pregao', 'concorrencia', 'tomada_preco', 'convite'],
    required: true
  },
  valor_estimado: { type: Number, required: true },
  data_abertura: { type: Date, required: true },
  data_fechamento: { type: Date, required: true },
  requisitos_tecnicos: String,
  criterio_julgamento: {
    type: String,
    enum: ['menor_preco', 'melhor_tecnica', 'tecnica_preco'],
    default: 'menor_preco'
  },
  orgao_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  status: {
    type: String,
    enum: ['rascunho', 'publicado', 'aberto', 'em_analise', 'finalizado', 'cancelado'],
    default: 'rascunho'
  },
  hash_blockchain: String,
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now }
});

const propostaSchema = new mongoose.Schema({
  licitacao_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Licitacao', required: true },
  empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  valor_proposta: { type: Number, required: true },
  prazo_execucao: { type: Number, required: true },
  descricao_proposta: String,
  status: {
    type: String,
    enum: ['enviada', 'em_analise', 'classificada', 'vencedora', 'desclassificada'],
    default: 'enviada'
  },
  resultado_analise: {
    observacoes: String,
    pontuacao: Number,
    data_avaliacao: Date
  },
  hash_blockchain: String,
  data_envio: { type: Date, default: Date.now }
});

const documentoSchema = new mongoose.Schema({
  tipo_documento: {
    type: String,
    enum: ['edital', 'proposta', 'anexo'],
    required: true
  },
  referencia_id: mongoose.Schema.Types.ObjectId,
  nome_arquivo: { type: String, required: true },
  nome_original: { type: String, required: true },
  caminho_arquivo: { type: String, required: true },
  hash_arquivo: { type: String, required: true, unique: true },
  hash_blockchain: String,
  publico: { type: Boolean, default: true },
  usuario_upload: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  data_upload: { type: Date, default: Date.now }
});

const transacaoSchema = new mongoose.Schema({
  id_transacao: { type: String, required: true, unique: true },
  tipo: { type: String, required: true }, 
  usuario_id: { type: String, required: true },
  dados: { type: mongoose.Schema.Types.Mixed, required: true },
  hash: { type: String, required: true, unique: true },
  timestamp: { type: Number, required: true },
  confirmado: { type: Boolean, default: true },
  data_criacao: { type: Date, default: Date.now }
});

// Models
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Licitacao = mongoose.model('Licitacao', licitacaoSchema);
const Proposta = mongoose.model('Proposta', propostaSchema);
const Documento = mongoose.model('Documento', documentoSchema);
const Transacao = mongoose.model('Transacao', transacaoSchema);

// Classe Blockchain
class BlockchainSimples {
  
  async criarTransacao(tipo, usuarioId, dados) {
    const transactionId = crypto.randomUUID();
    const timestamp = Date.now();
    
    const transactionData = {
      id_transacao: transactionId,
      tipo,
      usuario_id: usuarioId,
      dados,
      timestamp
    };
    
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(transactionData))
      .digest('hex');
    
    const transacao = new Transacao({
      ...transactionData,
      hash,
      confirmado: true
    });
    
    await transacao.save();
    return hash;
  }

  async verificarTransacao(hash) {
    const transacao = await Transacao.findOne({ hash });
    
    if (!transacao) {
      return { encontrada: false, mensagem: 'Transação não encontrada' };
    }
    
    return {
      encontrada: true,
      transacao: {
        id: transacao.id_transacao,
        tipo: transacao.tipo,
        dados: transacao.dados,
        timestamp: transacao.timestamp,
        confirmado: transacao.confirmado
      }
    };
  }

  async obterHistorico(entidadeId) {
    const transacoes = await Transacao.find({
      $or: [
        { usuario_id: entidadeId },
        { 'dados.licitacao_id': entidadeId },
        { 'dados.proposta_id': entidadeId }
      ]
    }).sort({ timestamp: 1 });

    return transacoes.map(tx => ({
      id: tx.id_transacao,
      tipo: tx.tipo,
      dados: tx.dados,
      timestamp: tx.timestamp,
      hash: tx.hash
    }));
  }
}

const blockchain = new BlockchainSimples();

// Configuração do Upload de Arquivos
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Middlewares de Autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

const authorizeGoverno = (req, res, next) => {
  if (req.user.tipo_usuario !== 'governo') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso restrito a usuários governamentais' 
    });
  }
  next();
};

const authorizeEmpresa = (req, res, next) => {
  if (req.user.tipo_usuario !== 'empresa') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso restrito a empresas' 
    });
  }
  next();
};

// Rotas de Autenticação - Registro
app.post('/api/auth/register', [
  body('usuario').isLength({ min: 3 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('senha').isLength({ min: 6 }),
  body('tipo_usuario').isIn(['cidadao', 'empresa', 'governo'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { usuario, email, senha, tipo_usuario, empresa } = req.body;

    
    const existingUser = await Usuario.findOne({ $or: [{ usuario }, { email }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário ou email já cadastrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
  
    const novoUsuario = new Usuario({
      usuario,
      email,
      senha: hashedPassword,
      tipo_usuario,
      empresa: tipo_usuario === 'empresa' ? empresa : undefined
    });

    await novoUsuario.save();

    const hashBlockchain = await blockchain.criarTransacao('cadastro', novoUsuario._id.toString(), {
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
});

// Rotas de Autenticação - Login
app.post('/api/auth/login', [
  body('usuario').notEmpty(),
  body('senha').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { usuario, senha } = req.body;

    const user = await Usuario.findOne({ 
      $or: [{ usuario }, { email: usuario }] 
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        usuario: user.usuario, 
        tipo_usuario: user.tipo_usuario 
      },
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
});

// Rota do Governo - Criar Licitação
app.post('/api/licitacoes/create', 
  authenticateToken, 
  authorizeGoverno,
  [
    body('titulo').notEmpty(),
    body('descricao').notEmpty(),
    body('objeto_licitacao').notEmpty(),
    body('modalidade').isIn(['pregao', 'concorrencia', 'tomada_preco', 'convite']),
    body('valor_estimado').isNumeric(),
    body('data_abertura').isISO8601(),
    body('data_fechamento').isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        titulo, descricao, objeto_licitacao, modalidade,
        valor_estimado, data_abertura, data_fechamento,
        requisitos_tecnicos, criterio_julgamento
      } = req.body;

      const ano = new Date().getFullYear();
      const count = await Licitacao.countDocuments();
      const numeroEdital = `${String(count + 1).padStart(3, '0')}/${ano}`;

      const novaLicitacao = new Licitacao({
        numero_edital: numeroEdital,
        titulo, descricao, objeto_licitacao, modalidade,
        valor_estimado, data_abertura, data_fechamento,
        requisitos_tecnicos, criterio_julgamento,
        orgao_id: req.user.id
      });

      await novaLicitacao.save();
      
      const hashBlockchain = await blockchain.criarTransacao('licitacao', req.user.id, {
        licitacao_id: novaLicitacao._id.toString(),
        numero_edital: numeroEdital,
        titulo, valor_estimado
      });

      novaLicitacao.hash_blockchain = hashBlockchain;
      await novaLicitacao.save();

      res.status(201).json({
        success: true,
        data: {
          id: novaLicitacao._id,
          numero_edital: numeroEdital,
          hash_blockchain: hashBlockchain
        }
      });
    } catch (error) {
      console.error('Erro ao criar licitação:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota do Governo - Listar Licitações
app.get('/api/licitacoes/list', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = {};
    
    if (req.user.tipo_usuario === 'governo') {
      query.orgao_id = req.user.id;
    } else {
      
      query.status = { $in: ['publicado', 'aberto', 'em_analise', 'finalizado'] };
    }
    
    if (status) {
      query.status = status;
    }
    
    const licitacoes = await Licitacao.find(query)
      .populate('orgao_id', 'usuario')
      .sort({ data_criacao: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Licitacao.countDocuments(query);
    
    res.json({
      success: true,
      data: { licitacoes, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Erro ao listar licitações:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Rota do Governo - Publicar Licitações
app.post('/api/licitacoes/publish/:id', 
  authenticateToken, 
  authorizeGoverno,
  async (req, res) => {
    try {
      const licitacao = await Licitacao.findOne({
        _id: req.params.id,
        orgao_id: req.user.id
      });

      if (!licitacao) {
        return res.status(404).json({ 
          success: false, 
          message: 'Licitação não encontrada' 
        });
      }

      if (licitacao.status !== 'rascunho') {
        return res.status(400).json({ 
          success: false, 
          message: 'Apenas licitações em rascunho podem ser publicadas' 
        });
      }

      licitacao.status = 'publicado';
      licitacao.data_atualizacao = new Date();
      await licitacao.save();
      
      const hashBlockchain = await blockchain.criarTransacao('publicacao', req.user.id, {
        licitacao_id: licitacao._id.toString(),
        numero_edital: licitacao.numero_edital,
        status: 'publicado'
      });

      res.json({
        success: true,
        data: { 
          id: licitacao._id,
          status: 'publicado',
          hash_blockchain: hashBlockchain 
        }
      });
    } catch (error) {
      console.error('Erro ao publicar licitação:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota de Empresa - Enviar Proposta
app.post('/api/propostas/enviar',
  authenticateToken,
  authorizeEmpresa,
  [
    body('licitacao_id').notEmpty(),
    body('valor_proposta').isNumeric(),
    body('prazo_execucao').isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { licitacao_id, valor_proposta, prazo_execucao, descricao_proposta } = req.body;

      const licitacao = await Licitacao.findById(licitacao_id);
      
      if (!licitacao || !['publicado', 'aberto'].includes(licitacao.status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Licitação não disponível para propostas' 
        });
      }

      if (new Date(licitacao.data_fechamento) <= new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Prazo de envio expirado' 
        });
      }

      const propostaExistente = await Proposta.findOne({
        empresa_id: req.user.id,
        licitacao_id: licitacao_id
      });

      if (propostaExistente) {
        return res.status(400).json({ 
          success: false, 
          message: 'Você já enviou uma proposta para esta licitação' 
        });
      }

      const novaProposta = new Proposta({
        licitacao_id, empresa_id: req.user.id,
        valor_proposta, prazo_execucao, descricao_proposta
      });

      await novaProposta.save();

      const hashBlockchain = await blockchain.criarTransacao('proposta', req.user.id, {
        proposta_id: novaProposta._id.toString(),
        licitacao_id, valor_proposta, prazo_execucao
      });

      novaProposta.hash_blockchain = hashBlockchain;
      await novaProposta.save();

      res.status(201).json({
        success: true,
        data: {
          id: novaProposta._id,
          hash_blockchain: hashBlockchain
        }
      });
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota de Empresa - Minhas Propostas
app.get('/api/propostas/minhas', authenticateToken, authorizeEmpresa, async (req, res) => {
  try {
    const propostas = await Proposta.find({ empresa_id: req.user.id })
      .populate('licitacao_id', 'titulo numero_edital status data_fechamento')
      .sort({ data_envio: -1 });

    res.json({ success: true, data: propostas });
  } catch (error) {
    console.error('Erro ao listar propostas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Rota de Governo - Ver Propostas da licitção
app.get('/api/propostas/licitacao/:id', 
  authenticateToken, 
  authorizeGoverno,
  async (req, res) => {
    try {
      
      const licitacao = await Licitacao.findOne({
        _id: req.params.id,
        orgao_id: req.user.id
      });

      if (!licitacao) {
        return res.status(404).json({ 
          success: false, 
          message: 'Licitação não encontrada' 
        });
      }

      const propostas = await Proposta.find({ licitacao_id: req.params.id })
        .populate('empresa_id', 'usuario empresa')
        .sort({ valor_proposta: 1 });

      res.json({ success: true, data: propostas });
    } catch (error) {
      console.error('Erro ao listar propostas:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota de Governo - Avaliar Proposta
app.post('/api/propostas/avaliar/:id',
  authenticateToken,
  authorizeGoverno,
  [body('status').isIn(['classificada', 'vencedora', 'desclassificada'])],
  async (req, res) => {
    try {
      const { status, observacoes, pontuacao } = req.body;

      const proposta = await Proposta.findById(req.params.id)
        .populate('licitacao_id');

      if (!proposta) {
        return res.status(404).json({ 
          success: false, 
          message: 'Proposta não encontrada' 
        });
      }

      if (proposta.licitacao_id.orgao_id.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Sem permissão para avaliar esta proposta' 
        });
      }

      proposta.status = status;
      proposta.resultado_analise = {
        observacoes, pontuacao,
        data_avaliacao: new Date()
      };

      await proposta.save();

      const hashBlockchain = await blockchain.criarTransacao('avaliacao', req.user.id, {
        proposta_id: proposta._id.toString(),
        status, pontuacao
      });

      res.json({
        success: true,
        data: { id: proposta._id, status, hash_blockchain: hashBlockchain }
      });
    } catch (error) {
      console.error('Erro ao avaliar proposta:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota de Documentos - Upload 
app.post('/api/documentos/upload', 
  authenticateToken, 
  upload.single('arquivo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nenhum arquivo enviado' 
        });
      }

      const { tipo_documento, referencia_id, publico = true } = req.body;
      const fileBuffer = await fs.readFile(req.file.path);
      const hashArquivo = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const novoDocumento = new Documento({
        tipo_documento,
        referencia_id,
        nome_arquivo: req.file.filename,
        nome_original: req.file.originalname,
        caminho_arquivo: req.file.path,
        hash_arquivo: hashArquivo,
        publico,
        usuario_upload: req.user.id
      });

      await novoDocumento.save();

      const hashBlockchain = await blockchain.criarTransacao('documento', req.user.id, {
        documento_id: novoDocumento._id.toString(),
        nome_arquivo: req.file.originalname,
        hash_arquivo: hashArquivo
      });
      novoDocumento.hash_blockchain = hashBlockchain;
      await novoDocumento.save();

      res.json({
        success: true,
        data: {
          id: novoDocumento._id,
          nome_arquivo: req.file.originalname,
          hash_blockchain: hashBlockchain
        }
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      if (req.file) {
        try { await fs.unlink(req.file.path); } catch {}
      }
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota de Documentos - Listar Documentos
app.get('/api/documentos/list', authenticateToken, async (req, res) => {
  try {
    const { tipo, referencia_id } = req.query;
    let query = {};
    
    if (req.user.tipo_usuario !== 'governo') {
      query.publico = true;
    }
    if (tipo) query.tipo_documento = tipo;
    if (referencia_id) query.referencia_id = referencia_id;
    
    const documentos = await Documento.find(query)
      .populate('usuario_upload', 'usuario')
      .sort({ data_upload: -1 });
    
    res.json({ success: true, data: documentos });
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Rota do Blockchain - Verificar Dados
app.post('/api/blockchain/verificar', 
  authenticateToken,
  [body('hash').notEmpty()],
  async (req, res) => {
    try {
      const { hash } = req.body;
      const resultado = await blockchain.verificarTransacao(hash);
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Erro na verificação blockchain:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota do Blockchain - Histórico da Licitação
app.get('/api/blockchain/historico/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const historico = await blockchain.obterHistorico(id);
    res.json({
      success: true,
      data: {
        entidade_id: id,
        transacoes: historico
      }
    });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Rotas do Dashboard Governo, Empresa e Cidadão
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = {};
    
    if (req.user.tipo_usuario === 'governo') {
      
      const [totalLicitacoes, abertas, finalizadas, totalPropostas] = await Promise.all([
        Licitacao.countDocuments({ orgao_id: req.user.id }),
        Licitacao.countDocuments({ orgao_id: req.user.id, status: 'aberto' }),
        Licitacao.countDocuments({ orgao_id: req.user.id, status: 'finalizado' }),
        Proposta.aggregate([
          {
            $lookup: {
              from: 'licitacaos',
              localField: 'licitacao_id',
              foreignField: '_id',
              as: 'licitacao'
            }
          },
          {
            $match: {
              'licitacao.orgao_id': new mongoose.Types.ObjectId(req.user.id)
            }
          },
          { $count: 'total' }
        ])
      ]);
      
      stats.licitacoes = { total: totalLicitacoes, abertas, finalizadas };
      stats.propostas = { total: totalPropostas[0]?.total || 0 };
      
    } else if (req.user.tipo_usuario === 'empresa') {
      
      const [minhasPropostas, vencedoras, licitacoesDisponiveis] = await Promise.all([
        Proposta.countDocuments({ empresa_id: req.user.id }),
        Proposta.countDocuments({ empresa_id: req.user.id, status: 'vencedora' }),
        Licitacao.countDocuments({ 
          status: { $in: ['publicado', 'aberto'] },
          data_fechamento: { $gt: new Date() }
        })
      ]);
      
      stats.propostas = { total: minhasPropostas, vencedoras };
      stats.licitacoes_disponiveis = licitacoesDisponiveis;
      
    } else {
      
      const [licitacoesPublicas, documentosPublicos, transacoes] = await Promise.all([
        Licitacao.countDocuments({ 
          status: { $in: ['publicado', 'aberto', 'em_analise', 'finalizado'] }
        }),
        Documento.countDocuments({ publico: true }),
        Transacao.countDocuments()
      ]);
      stats.licitacoes_publicas = licitacoesPublicas;
      stats.documentos_publicos = documentosPublicos;
      stats.transacoes_blockchain = transacoes;
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Rota de Transparência pública
app.get('/api/transparencia', async (req, res) => {
  try {
    const [
      totalLicitacoes,
      licitacoesAbertas,
      valorTotalLicitacoes,
      empresasParticipantes,
      documentosPublicos
    ] = await Promise.all([
      Licitacao.countDocuments({ status: { $ne: 'rascunho' } }),
      Licitacao.countDocuments({ status: 'aberto' }),
      Licitacao.aggregate([
        { $match: { status: { $ne: 'rascunho' } } },
        { $group: { _id: null, total: { $sum: '$valor_estimado' } } }
      ]),
      Proposta.distinct('empresa_id').then(arr => arr.length),
      Documento.countDocuments({ publico: true })
    ]);
    res.json({
      success: true,
      data: {
        licitacoes: {
          total: totalLicitacoes,
          abertas: licitacoesAbertas,
          valor_total: valorTotalLicitacoes[0]?.total || 0
        },
        empresas_participantes: empresasParticipantes,
        documentos_publicos: documentosPublicos,
        ultima_atualizacao: new Date()
      }
    });
  } catch (error) {
    console.error('Erro nas estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Detalhes da Licitação públicos
app.get('/api/licitacao/:id/detalhes', async (req, res) => {
  try {
    const licitacao = await Licitacao.findOne({
      _id: req.params.id,
      status: { $in: ['publicado', 'aberto', 'em_analise', 'finalizado'] }
    }).populate('orgao_id', 'usuario');
    
    if (!licitacao) {
      return res.status(404).json({ 
        success: false, 
        message: 'Licitação não encontrada ou não pública' 
      });
    }
    let propostas = [];
    if (licitacao.status === 'finalizado') {
      propostas = await Proposta.find({ licitacao_id: licitacao._id })
        .populate('empresa_id', 'usuario empresa.razao_social')
        .select('valor_proposta prazo_execucao status resultado_analise');
    }
    const documentos = await Documento.find({
      referencia_id: licitacao._id,
      publico: true,
      tipo_documento: 'edital'
    }).select('nome_original data_upload hash_arquivo');
    res.json({
      success: true,
      data: {
        licitacao,
        propostas,
        documentos,
        timeline: [
          { evento: 'Criação', data: licitacao.data_criacao },
          { evento: 'Abertura', data: licitacao.data_abertura },
          { evento: 'Fechamento', data: licitacao.data_fechamento }
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Configuração do Swagger
setupSwagger(app);

// Tratamento de Erros
app.use((error, req, res, next) => {
  console.error('Erro:', error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Registro duplicado'
    });
  }
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Iniciar Servidor
async function startServer() {
  try {
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Conectado ao MongoDB');

    //Swagger
    updateSwaggerInfo(process.env.NODE_ENV || 'development');
    
    await fs.mkdir('./uploads/', { recursive: true });
    console.log(' Diretórios de upload criados');
    
    app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`);
      console.log(` API disponível em http://localhost:${PORT}/api`);
      console.log(`-------------------------------------------------`);
    });
  } catch (error) {
    console.error(' Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
module.exports = app;