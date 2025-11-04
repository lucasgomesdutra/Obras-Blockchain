const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Usuario = require('../../models/usuario.models');
const Licitacao = require('../../models/licitacao.models');
const Proposta = require('../../models/proposta.models');

describe('Fluxo Completo E2E', () => {
  let mongoServer;
  let tokenGoverno;
  let tokenEmpresa;
  let tokenCidadao;
  let licitacaoId;
  let propostaId;

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
  });

  test('Fluxo completo: Governo cria licitação, empresa envia proposta, governo avalia', async () => {
    // 1. Registrar usuário governo
    const resGoverno = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'governo_fluxo',
        email: 'governo@fluxo.com',
        senha: '123456789',
        tipo_usuario: 'governo'
      })
      .expect(201);

    expect(resGoverno.body.success).toBe(true);
    expect(resGoverno.body.data.hash_blockchain).toBeDefined();

    // 2. Login governo
    const loginGoverno = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'governo_fluxo',
        senha: '123456789'
      })
      .expect(200);

    tokenGoverno = loginGoverno.body.data.token;
    expect(tokenGoverno).toBeDefined();

    // 3. Criar licitação
    const resLicitacao = await request(app)
      .post('/api/licitacoes/create')
      .set('Authorization', `Bearer ${tokenGoverno}`)
      .send({
        titulo: 'Construção de Ponte',
        descricao: 'Licitação para construção de ponte',
        objeto_licitacao: 'Obra de construção civil',
        modalidade: 'concorrencia',
        valor_estimado: 5000000,
        data_abertura: new Date(Date.now() + 86400000).toISOString(),
        data_fechamento: new Date(Date.now() + 2592000000).toISOString(),
        requisitos_tecnicos: 'Experiência mínima de 10 anos',
        criterio_julgamento: 'menor_preco'
      })
      .expect(201);

    licitacaoId = resLicitacao.body.data.id;
    expect(licitacaoId).toBeDefined();
    expect(resLicitacao.body.data.numero_edital).toBeDefined();

    // 4. Publicar licitação
    const resPublicar = await request(app)
      .post(`/api/licitacoes/publish/${licitacaoId}`)
      .set('Authorization', `Bearer ${tokenGoverno}`)
      .expect(200);

    expect(resPublicar.body.data.status).toBe('publicado');

    // 5. Registrar empresa
    await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'empresa_fluxo',
        email: 'empresa@fluxo.com',
        senha: '123456789',
        tipo_usuario: 'empresa',
        empresa: {
          cnpj: '11.111.111/0001-11',
          razao_social: 'Construtora Fluxo LTDA',
          telefone: '(11) 91111-1111',
          endereco: 'Rua do Fluxo, 100'
        }
      })
      .expect(201);

    // 6. Login empresa
    const loginEmpresa = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'empresa_fluxo',
        senha: '123456789'
      })
      .expect(200);

    tokenEmpresa = loginEmpresa.body.data.token;

    // 7. Empresa visualiza licitações disponíveis
    const resListar = await request(app)
      .get('/api/licitacoes/list')
      .set('Authorization', `Bearer ${tokenEmpresa}`)
      .expect(200);

    expect(resListar.body.data.licitacoes).toHaveLength(1);
    expect(resListar.body.data.licitacoes[0].status).toBe('publicado');

    // 8. Empresa envia proposta
    const resProposta = await request(app)
      .post('/api/propostas/enviar')
      .set('Authorization', `Bearer ${tokenEmpresa}`)
      .send({
        licitacao_id: licitacaoId,
        valor_proposta: 4500000,
        prazo_execucao: 540,
        descricao_proposta: 'Proposta completa atendendo todos os requisitos'
      })
      .expect(201);

    propostaId = resProposta.body.data.id;
    expect(propostaId).toBeDefined();

    // 9. Empresa verifica suas propostas
    const resMinhas = await request(app)
      .get('/api/propostas/minhas')
      .set('Authorization', `Bearer ${tokenEmpresa}`)
      .expect(200);

    expect(resMinhas.body.data).toHaveLength(1);
    expect(resMinhas.body.data[0].status).toBe('enviada');

    // 10. Registrar cidadão
    await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'cidadao_fluxo',
        email: 'cidadao@fluxo.com',
        senha: '123456789',
        tipo_usuario: 'cidadao'
      })
      .expect(201);

    // 11. Login cidadão
    const loginCidadao = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'cidadao_fluxo',
        senha: '123456789'
      })
      .expect(200);

    tokenCidadao = loginCidadao.body.data.token;

    // 12. Cidadão visualiza dados de transparência
    const resTransparencia = await request(app)
      .get('/api/transparencia')
      .expect(200);

    expect(resTransparencia.body.data.licitacoes.total).toBeGreaterThan(0);
    expect(resTransparencia.body.data.empresas_participantes).toBeGreaterThan(0);

    // 13. Cidadão visualiza detalhes da licitação
    const resDetalhes = await request(app)
      .get(`/api/licitacao/${licitacaoId}/detalhes`)
      .expect(200);

    expect(resDetalhes.body.data.licitacao).toBeDefined();
    expect(resDetalhes.body.data.licitacao.titulo).toBe('Construção de Ponte');

    // 14. Verificar integridade blockchain
    const resVerificar = await request(app)
      .post('/api/blockchain/verificar')
      .set('Authorization', `Bearer ${tokenCidadao}`)
      .send({ hash: resLicitacao.body.data.hash_blockchain })
      .expect(200);

    expect(resVerificar.body.data.encontrada).toBe(true);

    // 15. Dashboard de cada tipo de usuário
    const dashGoverno = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenGoverno}`)
      .expect(200);

    expect(dashGoverno.body.data.licitacoes).toBeDefined();

    const dashEmpresa = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenEmpresa}`)
      .expect(200);

    expect(dashEmpresa.body.data.propostas).toBeDefined();

    const dashCidadao = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenCidadao}`)
      .expect(200);

    expect(dashCidadao.body.data.licitacoes_publicas).toBeDefined();
  });

  test('Fluxo deve falhar em pontos de validação', async () => {
    // Tentar criar licitação sem autenticação
    await request(app)
      .post('/api/licitacoes/create')
      .send({
        titulo: 'Teste'
      })
      .expect(401);

    // Criar governo
    await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'gov_test',
        email: 'gov@test.com',
        senha: '123456789',
        tipo_usuario: 'governo'
      });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'gov_test', senha: '123456789' });

    const token = login.body.data.token;

    // Tentar criar licitação com dados inválidos
    await request(app)
      .post('/api/licitacoes/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Só título'
      })
      .expect(400);
  });
});