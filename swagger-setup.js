/**Configuração do Swagger*/

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
    
      console.log('Swagger Request:', req.method, req.url);
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2563eb; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 5px; }
  `,
  customSiteTitle: "API - Documentação",
  customfavIcon: "/favicon.ico"
};

function setupSwagger(app) {

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  

  app.get('/api-docs.yaml', (req, res) => {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.setHeader('Content-Disposition', 'attachment; filename="licitacoes-api.yaml"');
    res.sendFile(path.join(__dirname, 'swagger.yaml'));
  });
  

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument);
  });
  

  app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
  });
  

  app.use('/api-docs*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
  
  console.log('Swagger configurado:');
  console.log('Documentação: http://localhost:3000/api-docs');
  console.log('YAML: http://localhost:3000/api-docs.yaml');
  console.log('JSON: http://localhost:3000/api-docs.json');
  console.log('Atalho: http://localhost:3000/docs');
}

function updateSwaggerInfo(environment = 'development') {
  if (environment === 'production') {
    swaggerDocument.servers = [
      {
        url: 'http://localhost:3000/api',
      }
    ];
  }
  

  swaggerDocument.info.version = `1.0.0 (${new Date().toISOString()})`;
}

function generateExamples() {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  return {
    licitacao: {
      titulo: "Construção de Escola Municipal",
      descricao: "Licitação para construção de escola com 10 salas de aula e biblioteca",
      objeto_licitacao: "Obra de construção civil educacional", 
      modalidade: "concorrencia",
      valor_estimado: 2500000,
      data_abertura: now.toISOString(),
      data_fechamento: futureDate.toISOString(),
      requisitos_tecnicos: "Experiência mínima de 5 anos em obras públicas",
      criterio_julgamento: "menor_preco"
    },
    proposta: {
      valor_proposta: 2350000,
      prazo_execucao: 365,
      descricao_proposta: "Proposta técnica completa seguindo todas as especificações do edital"
    }
  };
}

module.exports = {
  setupSwagger,
  updateSwaggerInfo,
  generateExamples,
  swaggerDocument
};