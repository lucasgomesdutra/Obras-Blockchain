const TransparenciaService = require('../services/transparencia.service');

class TransparenciaController {
  async resumo(req, res) {
    try {
      const dados = await TransparenciaService.obterResumo();

      res.json({ success: true, data: dados });
    } catch (error) {
      console.error('Erro nas estatísticas:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TransparenciaController();