const DashboardService = require('../services/dashboard.service');

class DashboardController {
  async dashboard(req, res) {
    try {
      let stats;

      switch (req.user.tipo_usuario) {
        case 'governo':
          stats = await DashboardService.obterDashboardGoverno(req.user.id);
          break;
        case 'empresa':
          stats = await DashboardService.obterDashboardEmpresa(req.user.id);
          break;
        case 'cidadao':
          stats = await DashboardService.obterDashboardCidadao();
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Tipo de usuário inválido' 
          });
      }

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DashboardController();