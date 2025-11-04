const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Usuario = require('../../models/usuario.models');
const Licitacao = require('../../models/licitacao.models');
const Proposta = require('../../models/proposta.models');

describe('Proposta Integration Tests', () => {
  let mongoServer;
  let tokenGoverno;
  let tokenEmpresa;
  let usuarioGovernoId;
  let usuarioEmpresaId;
  let licitacaoPublicadaId;

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
    await Proposta.deleteMany({});

    // Criar usuários
    const resGoverno = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'governo_test',
        email: 'governo@test.com',
        senha: '123456789',
        tipo_usuario: 'governo'
      });
    
    usuarioGovernoId = resGoverno.body.data.id;

    const loginGoverno = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'governo_test',
        senha: '123456789'
      });
    
    tokenGoverno = loginGoverno.body.data.token;

    const resEmpresa = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'empresa_test',
        email: 'empresa@test.com',
        senha: '123456789',
        tipo_usuario: 'empresa',
        empresa: {
          cnpj: '12.345.678/0001-90',
          razao_social: 'Empresa Test LTDA'
        }
      });

    usuarioEmpresaId = resEmpresa.body.data.id;

    const loginEmpresa = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'empresa_test',
        senha: '123456789'
      });
    
    tokenEmpresa = loginEmpresa.body.data.token;

    // Criar licitação publicada
    const licitacao = await Licitacao.create({
      numero_edital: '001/2025',
      titulo: 'Licitação Teste',
      descricao: 'Teste',
      objeto_licitacao: 'Teste',
      modalidade: 'pregao',
      valor_estimado: 100000,
      data_abertura: new Date(),
      data_fechamento: new Date(Date.now() + 2592000000),
      orgao_id: usuarioGovernoId,
      status: 'publicado'
    });

    licitacaoPublicadaId = licitacao._id.toString();
  });

  describe('POST /api/propostas/enviar', () => {
    test('Empresa deve enviar proposta com sucesso', async () => {
      const proposta = {
        licitacao_id: licitacaoPublicadaId,
        valor_proposta: 95000,
        prazo_execucao: 180,
        descricao_proposta: 'Proposta técnica completa'
      };

      const response = await request(app)
        .post('/api/propostas/enviar')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .send(proposta)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.hash_blockchain).toBeDefined();

      const propostaDB = await Proposta.findById(response.body.data.id);
      expect(propostaDB).toBeDefined();
      expect(propostaDB.valor_proposta).toBe(proposta.valor_proposta);
      expect(propostaDB.status).toBe('enviada');
    });

    test('Deve falhar ao enviar proposta sem autenticação', async () => {
      const response = await request(app)
        .post('/api/propostas/enviar')
        .send({
          licitacao_id: licitacaoPublicadaId,
          valor_proposta: 95000,
          prazo_execucao: 180
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('Deve falhar ao enviar proposta para licitação inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/propostas/enviar')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .send({
          licitacao_id: fakeId.toString(),
          valor_proposta: 95000,
          prazo_execucao: 180
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Deve falhar ao enviar proposta duplicada', async () => {
      const proposta = {
        licitacao_id: licitacaoPublicadaId,
        valor_proposta: 95000,
        prazo_execucao: 180,
        descricao_proposta: 'Primeira proposta'
      };

      await request(app)
        .post('/api/propostas/enviar')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .send(proposta)
        .expect(201);

      const response = await request(app)
        .post('/api/propostas/enviar')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .send({
          ...proposta,
          valor_proposta: 90000
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('já enviou');
    });

    test('Governo não deve poder enviar proposta', async () => {
      const response = await request(app)
        .post('/api/propostas/enviar')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .send({
          licitacao_id: licitacaoPublicadaId,
          valor_proposta: 95000,
          prazo_execucao: 180
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/propostas/minhas', () => {
    beforeEach(async () => {
      // Criar propostas de teste
      await Proposta.create({
        licitacao_id: licitacaoPublicadaId,
        empresa_id: usuarioEmpresaId,
        valor_proposta: 95000,
        prazo_execucao: 180,
        descricao_proposta: 'Proposta 1',
        status: 'enviada'
      });

      await Proposta.create({
        licitacao_id: licitacaoPublicadaId,
        empresa_id: usuarioEmpresaId,
        valor_proposta: 90000,
        prazo_execucao: 150,
        descricao_proposta: 'Proposta 2',
        status: 'em_analise'
      });
    });

    test('Empresa deve ver suas próprias propostas', async () => {
      const response = await request(app)
        .get('/api/propostas/minhas')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].valor_proposta).toBeDefined();
    });

    test('Deve falhar sem autenticação', async () => {
      const response = await request(app)
        .get('/api/propostas/minhas')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});