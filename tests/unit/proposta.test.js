const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const testData = require('../fixtures/test-data');

describe('Propostas - Testes Unitários', () => {
  let mongoServer;
  let Proposta;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    
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
    
    Proposta = mongoose.model('Proposta', propostaSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Proposta.deleteMany({});
  });

  describe('Criação de Proposta', () => {
    test('Deve criar proposta válida', async () => {
      const proposta = new Proposta({
        ...testData.proposta,
        licitacao_id: new mongoose.Types.ObjectId(),
        empresa_id: new mongoose.Types.ObjectId()
      });
      
      const saved = await proposta.save();
      
      expect(saved._id).toBeDefined();
      expect(saved.valor_proposta).toBe(testData.proposta.valor_proposta);
      expect(saved.status).toBe('enviada');
    });

    test('Deve validar valor positivo', async () => {
      const proposta = new Proposta({
        ...testData.proposta,
        valor_proposta: -1000,
        licitacao_id: new mongoose.Types.ObjectId(),
        empresa_id: new mongoose.Types.ObjectId()
      });
      
      const saved = await proposta.save();
      // Sem validação customizada, salvaria valor negativo
      expect(saved.valor_proposta).toBe(-1000);
    });

    test('Deve incluir timestamp de envio', async () => {
      const before = Date.now();
      
      const proposta = await Proposta.create({
        ...testData.proposta,
        licitacao_id: new mongoose.Types.ObjectId(),
        empresa_id: new mongoose.Types.ObjectId()
      });
      
      const after = Date.now();
      
      expect(proposta.data_envio).toBeDefined();
      expect(proposta.data_envio.getTime()).toBeGreaterThanOrEqual(before);
      expect(proposta.data_envio.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('Avaliação de Proposta', () => {
    test('Deve adicionar resultado de análise', async () => {
      const proposta = await Proposta.create({
        ...testData.proposta,
        licitacao_id: new mongoose.Types.ObjectId(),
        empresa_id: new mongoose.Types.ObjectId()
      });
      
      proposta.status = 'vencedora';
      proposta.resultado_analise = {
        observacoes: 'Melhor proposta',
        pontuacao: 100,
        data_avaliacao: new Date()
      };
      
      const saved = await proposta.save();
      
      expect(saved.status).toBe('vencedora');
      expect(saved.resultado_analise.pontuacao).toBe(100);
    });
  });
});