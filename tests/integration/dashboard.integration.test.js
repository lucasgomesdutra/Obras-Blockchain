const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Usuario = require('../../models/usuario.models');
const Licitacao = require('../../models/licitacao.models');
const Proposta = require('../../models/proposta.models');

describe('Dashboard Integration Tests', () => {
  let mongoServer;
  let tokenGoverno;
  let tokenEmpresa;
  let tokenCidadao;
  let usuarioGovernoId;
  let usuarioEmpresaId;

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

    const loginGoverno = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'governo_test', senha: '123456789' });
    
    tokenGoverno = loginGoverno.body.data.token;

    // Criar usuário empresa
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
      .send({ usuario: 'empresa_test', senha: '123456789' });
    
    tokenEmpresa = loginEmpresa.body.data.token;

    // Criar usuário cidadão
    await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'cidadao_test',
        email: 'cidadao@test.com',
        senha: '123456789',
        tipo_usuario: 'cidadao'
      });

    const loginCidadao = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'cidadao_test', senha: '123456789' });
    
    tokenCidadao = loginCidadao.body.data.token;
  });

  describe('GET /api/dashboard - Governo', () => {
    beforeEach(async () => {
      // Criar licitações de teste
      await Licitacao.create({
        numero_edital: '001/2025',
        titulo: 'Licitação 1',
        descricao: 'Teste',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 100000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'aberto'
      });

      await Licitacao.create({
        numero_edital: '002/2025',
        titulo: 'Licitação 2',
        descricao: 'Teste',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 50000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'finalizado'
      });
    });

    test('Deve retornar estatísticas do governo', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacoes).toBeDefined();
      expect(response.body.data.licitacoes.total).toBe(2);
      expect(response.body.data.licitacoes.abertas).toBe(1);
      expect(response.body.data.licitacoes.finalizadas).toBe(1);
      expect(response.body.data.propostas).toBeDefined();
    });
  });

  describe('GET /api/dashboard - Empresa', () => {
    beforeEach(async () => {
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

      await Proposta.create({
        licitacao_id: licitacao._id,
        empresa_id: usuarioEmpresaId,
        valor_proposta: 95000,
        prazo_execucao: 180,
        status: 'enviada'
      });

      await Proposta.create({
        licitacao_id: licitacao._id,
        empresa_id: usuarioEmpresaId,
        valor_proposta: 90000,
        prazo_execucao: 150,
        status: 'vencedora'
      });
    });

    test('Deve retornar estatísticas da empresa', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.propostas).toBeDefined();
      expect(response.body.data.propostas.total).toBe(2);
      expect(response.body.data.propostas.vencedoras).toBe(1);
      expect(response.body.data.licitacoes_disponiveis).toBeDefined();
    });
  });

  describe('GET /api/dashboard - Cidadão', () => {
    beforeEach(async () => {
      await Licitacao.create({
        numero_edital: '001/2025',
        titulo: 'Licitação Pública',
        descricao: 'Teste',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 100000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'publicado'
      });
    });

    test('Deve retornar estatísticas públicas para cidadão', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${tokenCidadao}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacoes_publicas).toBeDefined();
      expect(response.body.data.documentos_publicos).toBeDefined();
      expect(response.body.data.transacoes_blockchain).toBeDefined();
    });
  });

  test('Deve falhar sem autenticação', async () => {
    const response = await request(app)
      .get('/api/dashboard')
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});