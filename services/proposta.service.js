const Proposta = require('../models/proposta.models');
const Licitacao = require('../models/licitacao.models');
const BlockchainService = require('./blockchain.services');

class PropostaService {
  async enviarProposta(dados, empresaId) {
    // Buscar licitação
    const licitacao = await Licitacao.findById(dados.licitacao_id);

    if (!licitacao || !['publicado', 'aberto'].includes(licitacao.status)) {
      throw new Error('Licitação não disponível');
    }

    // Verificar prazo
    if (new Date(licitacao.data_fechamento) <= new Date()) {
      throw new Error('Prazo expirado');
    }

    // Verificar se já enviou proposta
    const propostaExistente = await Proposta.findOne({
      empresa_id: empresaId,
      licitacao_id: dados.licitacao_id
    });

    if (propostaExistente) {
      throw new Error('Você já enviou uma proposta para esta licitação');
    }

    // Validações de negócio
    if (dados.valor_proposta <= 0) {
      throw new Error('Valor da proposta deve ser positivo');
    }

    if (dados.prazo_execucao <= 0) {
      throw new Error('Prazo de execução deve ser positivo');
    }

    // Criar proposta
    const novaProposta = await Proposta.create({
      licitacao_id: dados.licitacao_id,
      empresa_id: empresaId,
      valor_proposta: dados.valor_proposta,
      prazo_execucao: dados.prazo_execucao,
      descricao_proposta: dados.descricao_proposta
    });

    // Registrar no blockchain
    const hashBlockchain = await BlockchainService.criarTransacao('proposta', empresaId, {
      proposta_id: novaProposta._id.toString(),
      licitacao_id: dados.licitacao_id,
      valor_proposta: dados.valor_proposta,
      prazo_execucao: dados.prazo_execucao
    });

    novaProposta.hash_blockchain = hashBlockchain;
    await novaProposta.save();

    return novaProposta;
  }

  async listarMinhasPropostas(empresaId) {
    const propostas = await Proposta.find({ empresa_id: empresaId })
      .populate('licitacao_id', 'titulo numero_edital status data_fechamento')
      .sort({ data_envio: -1 });

    return propostas;
  }

  async listarPropostasPorLicitacao(licitacaoId, usuarioId) {
    // Verificar se a licitação pertence ao usuário
    const licitacao = await Licitacao.findOne({
      _id: licitacaoId,
      orgao_id: usuarioId
    });

    if (!licitacao) {
      throw new Error('Licitação não encontrada ou você não tem permissão');
    }

    const propostas = await Proposta.find({ licitacao_id: licitacaoId })
      .populate('empresa_id', 'empresa.razao_social empresa.cnpj')
      .sort({ data_envio: -1 });

    return propostas;
  }

  async avaliarProposta(propostaId, usuarioId, avaliacao) {
    // Buscar proposta com licitação
    const proposta = await Proposta.findById(propostaId).populate('licitacao_id');

    if (!proposta) {
      throw new Error('Proposta não encontrada');
    }

    // Verificar se a licitação pertence ao usuário
    if (proposta.licitacao_id.orgao_id.toString() !== usuarioId) {
      throw new Error('Você não tem permissão para avaliar esta proposta');
    }

    // Validar status
    const statusPermitidos = ['classificada', 'vencedora', 'desclassificada'];
    if (!statusPermitidos.includes(avaliacao.status)) {
      throw new Error('Status de avaliação inválido');
    }

    // Atualizar proposta
    proposta.status = avaliacao.status;
    proposta.resultado_analise = {
      observacoes: avaliacao.observacoes,
      pontuacao: avaliacao.pontuacao,
      data_avaliacao: new Date()
    };

    await proposta.save();

    // Registrar no blockchain
    const hashBlockchain = await BlockchainService.criarTransacao('avaliacao', usuarioId, {
      proposta_id: propostaId,
      status: avaliacao.status,
      pontuacao: avaliacao.pontuacao
    });

    return { proposta, hashBlockchain };
  }
}

module.exports = new PropostaService();