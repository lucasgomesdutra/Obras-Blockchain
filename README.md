Obras&Blockchain
ETEC Polivalente Americana

Integrantes da Equipe:
Lucas Gomes Dutra
Matheus Franco
Felipe Valentin Brongna
José de Henrique Almeida

Descrição do Projeto:

O Obras&Blockchain é uma plataforma que visa revolucionar o processo de licitações públicas no Brasil, promovendo transparência, eficiência e confiabilidade através da tecnologia blockchain.

Problema Identificado:

Falta de transparência nos processos licitatórios
Dificuldade de acompanhamento por parte dos cidadãos
Processos burocráticos lentos e complexos
Baixa participação de empresas em licitações
Suspeitas de irregularidades e corrupção

💡 Solução Proposta:
Nossa startup desenvolveu um sistema completo que conecta três atores principais:

Governo: Cria e gerencia licitações de forma digital
Empresas: Participam enviando propostas online
Cidadãos: Acompanham todo o processo com transparência total
Diferencial: Todas as transações são registradas em blockchain, garantindo imutabilidade e auditoria completa do processo.

Tecnologias Utilizadas:

Linguagem: JavaScript (Node.js 16+)
Framework: Express.js 4.18.2
Banco de Dados: MongoDB com Mongoose
Autenticação: JWT (JSON Web Tokens)
Criptografia: bcrypt para senhas
Blockchain: Implementação própria com SHA-256
Upload de Arquivos: Multer
Documentação: Swagger UI Express
Segurança: Helmet, CORS
Validação: Express-validator

Dependências Principais
json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "multer": "^1.4.5-lts.1",
  "helmet": "^7.0.0",
  "cors": "^2.8.5"
}

Instruções de Setup:

- Pré-requisitos
Node.js: Versão 16.0.0 ou superior
npm: Versão 8.0.0 ou superior
MongoDB: Local ou MongoDB Atlas
1. Clonagem do Repositório
bash
git clone https://github.com/seu-usuario/obras-blockchain.git
cd obras-blockchain
2. Instalação das Dependências
bash
npm install
3. Configuração das Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto:

env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados MongoDB
MONGODB_URI=mongodb://localhost:27017/licitacoes-blockchain
# Para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database

# Configurações de Segurança
BCRYPT_ROUNDS=10
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads/

# Logs
LOG_LEVEL=info
4. Criação do Diretório de Uploads
bash
npm run create-uploads
5. Execução do Projeto
Desenvolvimento (com auto-reload)
bash
npm run dev
Produção
bash
npm start
6. Verificação da Instalação
Acesse no navegador:

API: http://localhost:3000/api
Documentação: http://localhost:3000/api-docs
Swagger YAML: http://localhost:3000/api-docs.yaml
Funcionalidades Principais
Para o Governo
Criar e gerenciar licitações
Publicar editais
Receber e avaliar propostas
Dashboard administrativo
Upload de documentos
Para Empresas
Visualizar licitações abertas
Enviar propostas
Acompanhar status das propostas
Dashboard empresarial
Para Cidadãos
Consultar licitações públicas
Verificar transparência
acompanhar resultados
Verificar integridade blockchain
Testes
Executar Todos os Testes
bash
npm test
Testes com Cobertura
bash
npm run test:coverage
Testes de Integração
bash
npm run test:integration
Teste do Fluxo Completo (E2E)
bash
npm run test:e2e
Documentação da API
A documentação completa da API está disponível através do Swagger:

Swagger UI: http://localhost:3000/api-docs
Download YAML: http://localhost:3000/api-docs.yaml
Download JSON: http://localhost:3000/api-docs.json
Rotas Principais
Autenticação
POST /api/auth/register - Registrar usuário
POST /api/auth/login - Fazer login
Licitações (Governo)
POST /api/licitacoes/create - Criar licitação
POST /api/licitacoes/publish/:id - Publicar licitação
GET /api/licitacoes/list - Listar licitações
Propostas (Empresas)
POST /api/propostas/enviar - Enviar proposta
GET /api/propostas/minhas - Minhas propostas
Transparência (Cidadãos)
GET /api/transparencia - Dados públicos
GET /api/licitacao/:id/detalhes - Detalhes da licitação
Blockchain
POST /api/blockchain/verificar - Verificar transação
GET /api/blockchain/historico/:id - Histórico da entidade
🔗 Importação para Insomnia/Postman
O projeto inclui uma coleção completa para testes da API:

Arquivo: insomnia.json na raiz do projeto
Importar no Insomnia ou Postman
Configurar as variáveis de ambiente se necessário
Testar todos os endpoints disponíveis
Fluxo de Teste Recomendado
Registrar usuários (governo, empresa, cidadão)
Fazer login e obter tokens JWT
Criar licitação (governo)
Publicar licitação (governo)
Enviar proposta (empresa)
Avaliar proposta (governo)
Verificar transparência (cidadão)
🚀 Estrutura do Projeto
obras-blockchain/
├── 📁 coverage/              # Relatóriosde testes
├── 📁 tests/                 # Testes unitários e integração
│   ├── 📁 fixtures/          # Dados de teste
│   ├── 📁 setup/             # Configurações de teste
│   └── 📁 unit/              # Testes unitários
├── 📁 uploads/               # Diretório para arquivos
├── 📄 .env                   # Variáveis de ambiente
├── 📄 index.js               # Arquivo principal do servidor
├── 📄 swagger-setup.js       # Configuração do Swagger
├── 📄 swagger.yaml           # Documentação da API
├── 📄 insomnia.json          # Coleção Insomnia
├── 📄 package.json           # Dependências e scripts
└── 📄 README.md              # Esta documentação
🔧 Scripts Disponíveis
bash
npm start                     # Executar em produção
npm run dev                   # Executar em desenvolvimento
npm run create-uploads        # Criar diretório de uploads
npm test                      # Executar todos os testes
npm run test:watch            # Testes em modo watch
npm run test:coverage         # Testes com cobertura
npm run test:unit             # Apenas testes unitários
npm run test:integration      # Apenas testes de integração
npm run test:e2e              # Teste do fluxo completo
npm run test:verbose          # Testes com saída detalhada
npm run test:debug            # Testes em modo debug
Diferenciais Competitivos:

- Blockchain Próprio: Registros imutáveis e verificáveis
- Multi-usuário: Governo, Empresas e Cidadãos
- Interface Intuitiva: Fácil uso para todos os perfis
- Transparência Total: Acompanhamento em tempo real
- Documentação Completa: API totalmente documentada
- Testes Abrangentes: Cobertura completa de testes
- Pronto para Produção: Configurações de segurança implementadas

Contato:
Para dúvidas ou sugestões sobre o projeto:

Email: obraseblockchain@gmail.com
ETEC Polivalente Americana
Ano: 2025
