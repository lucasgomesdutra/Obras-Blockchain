const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Licitacao = require('../../models/licitacao.models');
const Proposta = require('../../models/proposta.models');
const Documento = require('../../models/documento.models');

describe('Transparência Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Licitacao.deleteMany({});
    await Proposta.deleteMany({});
    await Documento.deleteMany({});
  });

  describe('GET /api/transparencia', () => {
    test('Deve retornar dados públicos de transparência', async () => {
      // Criar dados de teste
      const orgaoId = new mongoose.Types.ObjectId();
      const empresaId = new mongoose.Types.ObjectId();

      await Licitacao.create({
        numero_edital: '001/2025',
        titulo: 'Licitação 1',
        descricao: 'Teste',
        objeto_licitacao: 'Teste',
        modalidade: 'pregao',
        valor_estimado: 100000,
        data_abertura: new Date(),
        data_fechamento: new Date(),
        orgao_id: orgaoId,
        status: 'publicado'
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
        orgao_id: orgaoId,
        status: 'aberto'
      });

      await Proposta.create({
        licitacao_id: new mongoose.Types.ObjectId(),
        empresa_id: empresaId,
        valor_proposta: 95000,
        prazo_execucao: 180
      });

      await Documento.create({
        tipo_documento: 'edital',
        referencia_id: new mongoose.Types.ObjectId(),
        nome_arquivo: 'teste.pdf',
        nome_original: 'teste.pdf',
        caminho_arquivo: '/uploads/teste.pdf',
        hash_arquivo: 'abc123',
        publico: true
      });

      const response = await request(app)
        .get('/api/transparencia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacoes).toBeDefined();
      expect(response.body.data.licitacoes.total).toBe(2);
      expect(response.body.data.licitacoes.abertas).toBe(1);
      expect(response.body.data.empresas_participantes).toBe(1);
      expect(response.body.data.documentos_publicos).toBe(1);
      expect(response.body.data.ultima_atualizacao).toBeDefined();
    });

    test('Deve retornar zeros quando não há dados', async () => {
      const response = await request(app)
        .get('/api/transparencia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licitacoes.total).toBe(0);
      expect(response.body.data.licitacoes.abertas).toBe(0);
      expect(response.body.data.licitacoes.valor_total).toBe(0);
      expect(response.body.data.empresas_participantes).toBe(0);
      expect(response.body.data.documentos_publicos).toBe(0);
    });
  });
});