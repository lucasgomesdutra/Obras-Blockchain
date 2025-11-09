const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Usuario = require('../../models/usuario.models');
const Licitacao = require('../../models/licitacao.models');

describe('Licitação Integration Tests', () => {
  let mongoServer;
  let tokenGoverno;
  let tokenEmpresa;
  let tokenCidadao;
  let usuarioGovernoId;

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
      .send({
        usuario: 'governo_test',
        senha: '123456789'
      });
    
    tokenGoverno = loginGoverno.body.data.token;

    // Criar usuário empresa
    await request(app)
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

    const loginEmpresa = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'empresa_test',
        senha: '123456789'
      });
    
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
      .send({
        usuario: 'cidadao_test',
        senha: '123456789'
      });
    
    tokenCidadao = loginCidadao.body.data.token;
  });

  describe('POST /api/licitacoes/create', () => {
    test('Deve criar licitação como governo', async () => {
      const licitacao = {
        titulo: 'Construção de Escola',
        descricao: 'Construção de escola municipal',
        objeto_licitacao: 'Obra de construção civil',
        modalidade: 'concorrencia',
        valor_estimado: 1000000,
        data_abertura: new Date(Date.now() + 86400000).toISOString(),
        data_fechamento: new Date(Date.now() + 2592000000).toISOString(),
        requisitos_tecnicos: 'Experiência mínima de 5 anos',
        criterio_julgamento: 'menor_preco'
      };

      const response = await request(app)
        .post('/api/licitacoes/create')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .send(licitacao)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.numero_edital).toBeDefined();
      expect(response.body.data.hash_blockchain).toBeDefined();

      const licitacaoDB = await Licitacao.findById(response.body.data.id);
      expect(licitacaoDB).toBeDefined();
      expect(licitacaoDB.titulo).toBe(licitacao.titulo);
      expect(licitacaoDB.status).toBe('rascunho');
    });

    test('Deve falhar ao criar licitação sem autenticação', async () => {
      const response = await request(app)
        .post('/api/licitacoes/create')
        .send({
          titulo: 'Teste'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('Deve falhar ao criar licitação como empresa', async () => {
      const response = await request(app)
        .post('/api/licitacoes/create')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .send({
          titulo: 'Teste',
          descricao: 'Teste',
          objeto_licitacao: 'Teste',
          modalidade: 'pregao',
          valor_estimado: 100000,
          data_abertura: new Date(Date.now() + 86400000).toISOString(),
          data_fechamento: new Date(Date.now() + 2592000000).toISOString()
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/licitacoes/list', () => {
    beforeEach(async () => {
      // Criar licitações de teste
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

      await Licitacao.create({
        numero_edital: '002/2025',
        titulo: 'Licitação Rascunho',
        descricao: 'Teste',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 50000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'rascunho'
      });
    });

    test('Governo deve ver todas suas licitações', async () => {
      const response = await request(app)
        .get('/api/licitacoes/list')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacoes).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    test('Empresa deve ver apenas licitações públicas', async () => {
      const response = await request(app)
        .get('/api/licitacoes/list')
        .set('Authorization', `Bearer ${tokenEmpresa}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacoes).toHaveLength(1);
      expect(response.body.data.licitacoes[0].status).toBe('publicado');
    });

    test('Deve filtrar licitações por status', async () => {
      const response = await request(app)
        .get('/api/licitacoes/list?status=publicado')
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.data.licitacoes).toHaveLength(1);
      expect(response.body.data.licitacoes[0].status).toBe('publicado');
    });
  });

  describe('POST /api/licitacoes/publish/:id', () => {
    let licitacaoId;

    beforeEach(async () => {
      const licitacao = await Licitacao.create({
        numero_edital: '001/2025',
        titulo: 'Licitação para Publicar',
        descricao: 'Teste',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 100000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'rascunho'
      });

      licitacaoId = licitacao._id.toString();
    });

    test('Deve publicar licitação em rascunho', async () => {
      const response = await request(app)
        .post(`/api/licitacoes/publish/${licitacaoId}`)
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('publicado');
      expect(response.body.data.hash_blockchain).toBeDefined();

      const licitacao = await Licitacao.findById(licitacaoId);
      expect(licitacao.status).toBe('publicado');
    });

    test('Deve falhar ao publicar licitação inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/licitacoes/publish/${fakeId}`)
        .set('Authorization', `Bearer ${tokenGoverno}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/licitacao/:id/detalhes', () => {
    let licitacaoPublicaId;
    let licitacaoRascunhoId;

    beforeEach(async () => {
      const licitacaoPublica = await Licitacao.create({
        numero_edital: '001/2025',
        titulo: 'Licitação Pública',
        descricao: 'Teste público',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 100000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'publicado'
      });

      const licitacaoRascunho = await Licitacao.create({
        numero_edital: '002/2025',
        titulo: 'Licitação Rascunho',
        descricao: 'Teste rascunho',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 50000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: usuarioGovernoId,
        status: 'rascunho'
      });

      licitacaoPublicaId = licitacaoPublica._id.toString();
      licitacaoRascunhoId = licitacaoRascunho._id.toString();
    });

    test('Deve obter detalhes de licitação pública', async () => {
      const response = await request(app)
        .get(`/api/licitacao/${licitacaoPublicaId}/detalhes`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacao).toBeDefined();
      expect(response.body.data.licitacao.titulo).toBe('Licitação Pública');
      expect(response.body.data.documentos).toBeDefined();
      expect(response.body.data.timeline).toBeDefined();
    });

    test('Deve falhar ao acessar licitação não pública', async () => {
      const response = await request(app)
        .get(`/api/licitacao/${licitacaoRascunhoId}/detalhes`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('Deve falhar com ID inválido', async () => {
      const response = await request(app)
        .get('/api/licitacao/invalid-id/detalhes')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});