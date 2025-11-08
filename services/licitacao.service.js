const Licitacao = require('../models/licitacao.models');
const Proposta = require('../models/proposta.models');
const Documento = require('../models/documento.models');
const BlockchainService = require('./blockchain.services');

class LicitacaoService {
  // Método para criar licitação
  async criarLicitacao(dados, usuarioId) {
    // Validações de negócio
    if (new Date(dados.data_fechamento) <= new Date(dados.data_abertura)) {
      throw new Error('Data de fechamento deve ser posterior à abertura');
    }
    
    // Gerar número do edital
    const ano = new Date().getFullYear();
    const count = await Licitacao.countDocuments();
    const numeroEdital = `${String(count + 1).padStart(3, '0')}/${ano}`;

    // Criar licitação
    const novaLicitacao = await Licitacao.create({
      numero_edital: numeroEdital,
      titulo: dados.titulo,
      descricao: dados.descricao,
      objeto_licitacao: dados.objeto_licitacao,
      modalidade: dados.modalidade,
      valor_estimado: dados.valor_estimado,
      data_abertura: dados.data_abertura,
      data_fechamento: dados.data_fechamento,
      requisitos_tecnicos: dados.requisitos_tecnicos,
      criterio_julgamento: dados.criterio_julgamento,
      orgao_id: usuarioId
    });

    // Registrar no blockchain
    const hashBlockchain = await BlockchainService.criarTransacao('licitacao', usuarioId, {
      licitacao_id: novaLicitacao._id.toString(),
      numero_edital: numeroEdital,
      titulo: dados.titulo,
      valor_estimado: dados.valor_estimado
    });

    novaLicitacao.hash_blockchain = hashBlockchain;
    await novaLicitacao.save();

    return novaLicitacao;
  }

  // Método para listar licitações
  async listarLicitacoes(usuarioId, tipoUsuario, filtros = {}) {
    const { status, limit = 20, offset = 0 } = filtros;
    const query = {};

    if (tipoUsuario === 'governo') {
      query.orgao_id = usuarioId;
    } else {
      query.status = { $in: ['publicado', 'aberto', 'em_analise', 'finalizado'] };
    }

    if (status) query.status = status;

    const licitacoes = await Licitacao.find(query)
      .populate('orgao_id', 'usuario')
      .sort({ data_criacao: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Licitacao.countDocuments(query);

    return { licitacoes, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  // Método para publicar licitação
  async publicarLicitacao(licitacaoId, usuarioId) {
    const licitacao = await Licitacao.findOne({
      _id: licitacaoId,
      orgao_id: usuarioId
    });

    if (!licitacao) {
      throw new Error('Licitação não encontrada');
    }

    if (licitacao.status !== 'rascunho') {
      throw new Error('Apenas licitações em rascunho podem ser publicadas');
    }

    licitacao.status = 'publicado';
    licitacao.data_atualizacao = new Date();
    await licitacao.save();

    const hashBlockchain = await BlockchainService.criarTransacao('publicacao', usuarioId, {
      licitacao_id: licitacao._id.toString(),
      numero_edital: licitacao.numero_edital,
      status: 'publicado'
    });

    return { licitacao, hashBlockchain };
  }

  // Método para obter detalhes da licitação
  async obterDetalhes(licitacaoId) {
    const licitacao = await Licitacao.findById(licitacaoId)
      .populate('orgao_id', 'usuario email');

    if (!licitacao) {
      throw new Error('Licitação não encontrada');
    }

    // Verificar se é pública
    if (!['publicado', 'aberto', 'em_analise', 'finalizado'].includes(licitacao.status)) {
      throw new Error('Licitação não disponível para consulta pública');
    }

    // Buscar documentos públicos
    const documentos = await Documento.find({
      referencia_id: licitacao._id,
      publico: true
    }).select('nome_original tipo_documento hash_arquivo data_upload');

    // Buscar propostas (só mostra se finalizada)
    let propostas = [];
    if (licitacao.status === 'finalizado') {
      propostas = await Proposta.find({ licitacao_id: licitacao._id })
        .populate('empresa_id', 'empresa.razao_social')
        .select('valor_proposta prazo_execucao status resultado_analise');
    }

    // Timeline de eventos
    const timeline = [
      { evento: 'Criação', data: licitacao.data_criacao },
      { evento: 'Publicação', data: licitacao.data_atualizacao }
    ];

    return { licitacao, documentos, propostas, timeline };
  }
}

module.exports = new LicitacaoService();