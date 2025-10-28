const Licitacao = require('../models/Licitacao');
const BlockchainService = require('../services/Blockchain');

class LicitacaoController {
  async create(req, res) {
    try {
      const {
        titulo,
        descricao,
        objeto_licitacao,
        modalidade,
        valor_estimado,
        data_abertura,
        data_fechamento,
        requisitos_tecnicos,
        criterio_julgamento
      } = req.body;

      const ano = new Date().getFullYear();
      const count = await Licitacao.countDocuments();
      const numeroEdital = `${String(count + 1).padStart(3, '0')}/${ano}`;

      const novaLicitacao = await Licitacao.create({
        numero_edital: numeroEdital,
        titulo,
        descricao,
        objeto_licitacao,
        modalidade,
        valor_estimado,
        data_abertura,
        data_fechamento,
        requisitos_tecnicos,
        criterio_julgamento,
        orgao_id: req.user.id
      });

      const hashBlockchain = await BlockchainService.criarTransacao('licitacao', req.user.id, {
        licitacao_id: novaLicitacao._id.toString(),
        numero_edital: numeroEdital,
        titulo,
        valor_estimado
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
  }

  async list(req, res) {
    try {
      const { status, limit = 20, offset = 0 } = req.query;
      const query = {};

      if (req.user.tipo_usuario === 'governo') {
        query.orgao_id = req.user.id;
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

      res.json({
        success: true,
        data: { licitacoes, total, limit: parseInt(limit), offset: parseInt(offset) }
      });
    } catch (error) {
      console.error('Erro ao listar licitações:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }

  async publish(req, res) {
    try {
      const licitacao = await Licitacao.findOne({
        _id: req.params.id,
        orgao_id: req.user.id
      });

      if (!licitacao)
        return res.status(404).json({ success: false, message: 'Licitação não encontrada' });

      if (licitacao.status !== 'rascunho')
        return res.status(400).json({
          success: false,
          message: 'Apenas licitações em rascunho podem ser publicadas'
        });

      licitacao.status = 'publicado';
      licitacao.data_atualizacao = new Date();
      await licitacao.save();

      const hashBlockchain = await BlockchainService.criarTransacao('publicacao', req.user.id, {
        licitacao_id: licitacao._id.toString(),
        numero_edital: licitacao.numero_edital,
        status: 'publicado'
      });

      res.json({
        success: true,
        data: { id: licitacao._id, status: 'publicado', hash_blockchain: hashBlockchain }
      });
    } catch (error) {
      console.error('Erro ao publicar licitação:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new LicitacaoController();
