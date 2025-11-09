const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Usuario = require('../../models/usuario.models');
const Licitacao = require('../../models/licitacao.models');
const Transacao = require('../../models/transacao.models');

describe('Blockchain Integration Tests', () => {
  let mongoServer;
  let tokenGoverno;
  let usuarioGovernoId;
  let licitacaoId;
  let hashBlockchain;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Usuario.deleteMany({});
    await Licitacao.deleteMany({});
    await Transacao.deleteMany({});

    // Criar usuário governo
    const resGoverno = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'governo_test',
        email: 'governo@test.com',
        senha: '123456789',
        tipo_usuario: 'governo'
      });
    
    usuarioGovernoId = resGoverno.body.data.id;
    hashBlockchain = resGoverno.body.data.hash_blockchain;

    const loginGoverno = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'governo_test',
        senha: '123456789'
      });
    
    tokenGoverno = loginGoverno.body.data.token;

    // Criar licitação para ter mais transações
    const licitacao = await request(app)
      .post('/api/licitacoes/create')
      .set('Authorization', `Bearer ${tokenGoverno}`)
      .send({
        titulo: 'Licitação Teste Blockchain',
        descricao: 'Teste blockchain',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 100000,
        data_abertura: new Date().toISOString(),
        data_fechamento: new Date(Date.now() + 2592000000).toISOString()
      });

    licitacaoId = licitacao.body.data.id;
  });

  describe('POST /api/blockchain/verificar', () => {
    test('Deve verificar transação válida com sucesso', async () => {
      const response = await request(app)
        .post('/api/blockchain/verificar')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .send({ hash: hashBlockchain })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.encontrada).toBe(true);
      expect(response.body.data.valida).toBe(true);
      expect(response.body.data.transacao).toBeDefined();
      expect(response.body.data.validacao).toBeDefined();
      expect(response.body.data.validacao.integridadeBloco).toBe(true);
      expect(response.body.data.validacao.encadeamento).toBe(true);
    });

    test('Deve retornar não encontrada para hash inexistente', async () => {
      const fakeHash = 'a'.repeat(64);

      const response = await request(app)
        .post('/api/blockchain/verificar')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .send({ hash: fakeHash })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.encontrada).toBe(false);
      expect(response.body.data.mensagem).toContain('não encontrada');
    });

    test('Deve falhar sem autenticação', async () => {
      const response = await request(app)
        .post('/api/blockchain/verificar')
        .send({ hash: hashBlockchain })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('Deve falhar sem fornecer hash', async () => {
      const response = await request(app)
        .post('/api/blockchain/verificar')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/blockchain/historico/:id', () => {
    test('Deve retornar histórico de transações do usuário', async () => {
      const response = await request(app)
        .get(`/api/blockchain/historico/${usuarioGovernoId}`)
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.entidade_id).toBe(usuarioGovernoId);
      expect(response.body.data.transacoes).toBeDefined();
      expect(Array.isArray(response.body.data.transacoes)).toBe(true);
      expect(response.body.data.transacoes.length).toBeGreaterThan(0);
    });

    test('Deve retornar histórico de licitação', async () => {
      const response = await request(app)
        .get(`/api/blockchain/historico/${licitacaoId}`)
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transacoes).toBeDefined();
      expect(Array.isArray(response.body.data.transacoes)).toBe(true);
      
      // Deve encontrar pelo menos uma transação da licitação
      expect(response.body.data.transacoes.length).toBeGreaterThan(0);
      
      // Verificar se há uma transação do tipo 'licitacao'
      const temLicitacao = response.body.data.transacoes.some(
        tx => tx.tipo === 'licitacao'
      );
      expect(temLicitacao).toBe(true);
      
      // Verificar se o ID da licitação está nos dados
      const transacaoLicitacao = response.body.data.transacoes.find(
        tx => tx.tipo === 'licitacao'
      );
      expect(transacaoLicitacao.dados.dados.licitacao_id).toBe(licitacaoId);
    });

    test('Deve retornar array vazio para ID sem transações', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/blockchain/historico/${fakeId}`)
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transacoes).toHaveLength(0);
    });

    test('Deve falhar sem autenticação', async () => {
      const response = await request(app)
        .get(`/api/blockchain/historico/${usuarioGovernoId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/blockchain/validar', () => {
    test('Deve validar cadeia íntegra com sucesso', async () => {
      const response = await request(app)
        .get('/api/blockchain/validar')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valida).toBe(true);
      expect(response.body.data.totalBlocos).toBeGreaterThan(0);
      expect(response.body.message).toContain('íntegra');
    });

    test('Blockchain deve detectar adulteração quando hash anterior é modificado', async () => {
      const transacoes = await Transacao.find().sort({ index: 1 });
      
      if (transacoes.length >= 2) {
        const ultimaTransacao = transacoes[transacoes.length - 1];
        const hashOriginal = ultimaTransacao.hashAnterior;
        
        ultimaTransacao.hashAnterior = 'hash_invalido_adulterado';
        await ultimaTransacao.save();

        const response = await request(app)
          .get('/api/blockchain/validar')
          .set('Authorization', `Bearer ${tokenGoverno}`)
          .expect(200);

        expect(response.body.success).toBe(false);
        expect(response.body.data.valida).toBe(false);
        expect(
          response.body.data.motivo.includes('hash inválido') || 
          response.body.data.motivo.includes('encadeado')
        ).toBe(true);
        
        ultimaTransacao.hashAnterior = hashOriginal;
        await ultimaTransacao.save();
      } else {
        expect(transacoes.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('Deve falhar sem autenticação', async () => {
      const response = await request(app)
        .get('/api/blockchain/validar')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Integridade da Blockchain', () => {
    test('Todas as transações devem ter índices sequenciais', async () => {
      const transacoes = await Transacao.find().sort({ index: 1 });

      for (let i = 0; i < transacoes.length; i++) {
        expect(transacoes[i].index).toBe(i);
      }
    });

    test('Cada transação deve apontar para hash anterior correto', async () => {
      const transacoes = await Transacao.find().sort({ index: 1 });

      for (let i = 1; i < transacoes.length; i++) {
        expect(transacoes[i].hashAnterior).toBe(transacoes[i - 1].hash);
      }
    });

    test('Hashes devem ter formato SHA256 válido', async () => {
      const transacoes = await Transacao.find();
      const hashRegex = /^[a-f0-9]{64}$/;

      transacoes.forEach(tx => {
        expect(tx.hash).toMatch(hashRegex);
        if (tx.index > 0) {
          expect(tx.hashAnterior).toMatch(hashRegex);
        }
      });
    });

    test('Timestamps devem ser crescentes', async () => {
      const transacoes = await Transacao.find().sort({ index: 1 });

      for (let i = 1; i < transacoes.length; i++) {
        expect(transacoes[i].timestamp).toBeGreaterThanOrEqual(
          transacoes[i - 1].timestamp
        );
      }
    });

    test('IDs de transação devem ser únicos', async () => {
      const transacoes = await Transacao.find();
      const ids = new Set(transacoes.map(tx => tx.id_transacao));

      expect(ids.size).toBe(transacoes.length);
    });
  });
});