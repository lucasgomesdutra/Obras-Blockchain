const PropostaService = require('../services/proposta.service');

class PropostaController {
  async enviar(req, res) {
    try {
      const proposta = await PropostaService.enviarProposta(req.body, req.user.id);

      res.status(201).json({ 
        success: true, 
        data: { 
          id: proposta._id, 
          hash_blockchain: proposta.hash_blockchain 
        } 
      });
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      
      const status = error.message.includes('não disponível') || 
                     error.message.includes('expirado') ||
                     error.message.includes('já enviou') ? 400 : 500;
      
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async listarMinhas(req, res) {
    try {
      const propostas = await PropostaService.listarMinhasPropostas(req.user.id);

      res.json({ success: true, data: propostas });
    } catch (error) {
      console.error('Erro ao listar propostas:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async listarPorLicitacao(req, res) {
    try {
      const propostas = await PropostaService.listarPropostasPorLicitacao(
        req.params.id,
        req.user.id
      );

      res.json({ success: true, data: propostas });
    } catch (error) {
      console.error('Erro ao listar propostas:', error);
      
      const status = error.message.includes('não encontrada') || 
                     error.message.includes('permissão') ? 404 : 500;
      
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async avaliar(req, res) {
    try {
      const { proposta, hashBlockchain } = await PropostaService.avaliarProposta(
        req.params.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        data: {
          id: proposta._id,
          status: proposta.status,
          hash_blockchain: hashBlockchain
        }
      });
    } catch (error) {
      console.error('Erro ao avaliar proposta:', error);
      
      let status = 500;
      if (error.message.includes('não encontrada')) status = 404;
      if (error.message.includes('permissão')) status = 403;
      if (error.message.includes('inválido')) status = 400;
      
      res.status(status).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PropostaController();