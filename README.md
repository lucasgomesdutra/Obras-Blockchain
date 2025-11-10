# 🏗️ Obras&Blockchain

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Blockchain](https://img.shields.io/badge/Blockchain-Custom-orange?style=for-the-badge&logo=bitcoin&logoColor=white)

**Sistema de Licitações Públicas com Tecnologia Blockchain**

*Promovendo transparência, eficiência e confiabilidade nos processos licitatórios brasileiros*

[📖 Documentação](#-documentação-da-api) • [🎥 Vídeo Demo](#-vídeo-demonstração) • [🚀 Instalação](#️-instalação) • [🧪 Testes](#-testes)

</div>

---

## 📌 Sobre o Projeto

O **Obras&Blockchain** é uma plataforma inovadora desenvolvida para revolucionar o processo de licitações públicas no Brasil, utilizando **tecnologia blockchain** para garantir transparência total, rastreabilidade e imutabilidade de todas as transações.

### 🏫 Instituição
**ETEC Polivalente Americana**  
Projeto desenvolvido para o **Hackateen 2025**

### 👥 Equipe de Desenvolvimento
- **Lucas Gomes Dutra**
- **Matheus Franco**
- **Felipe Valentin Brongna**
- **José de Henrique Almeida**

---

## 🎥 Vídeo Demonstração

📺 **Assista à demonstração completa do sistema:**

- **YouTube**: [https://youtu.be/MoeXD1XDfyY](https://youtu.be/MoeXD1XDfyY)
- **MediaFire**: [Download do vídeo](https://www.mediafire.com/file/rbz4loiat42e52j/Hackateen+Entrega.mp4/file)

---

## ❗ Problema Identificado

A gestão de licitações públicas no Brasil enfrenta diversos desafios:

- 🔴 **Falta de transparência** nos processos licitatórios
- 🔴 **Dificuldade de acompanhamento** por parte dos cidadãos
- 🔴 **Processos burocráticos** lentos e complexos
- 🔴 **Baixa participação** de empresas em licitações
- 🔴 **Suspeitas de irregularidades** e corrupção
- 🔴 **Ausência de rastreabilidade** das decisões tomadas

---

## 💡 Nossa Solução

Desenvolvemos um **sistema completo e integrado** que conecta três atores principais:

### 🏛️ **Governo**
- Cria e gerencia licitações de forma digital
- Publica editais com transparência total
- Recebe e avalia propostas online
- Dashboard administrativo completo
- Upload seguro de documentos

### 🏢 **Empresas**
- Visualiza licitações abertas em tempo real
- Envia propostas de forma digital
- Acompanha status das propostas
- Dashboard empresarial personalizado
- Histórico completo de participações

### 👤 **Cidadãos**
- Consulta licitações públicas livremente
- Verifica transparência das operações
- Acompanha resultados em tempo real
- Verifica integridade da blockchain
- Acesso a dados públicos de transparência

### 🔐 **Diferencial Tecnológico**

✨ **Blockchain Próprio**: Todas as transações são registradas em uma blockchain customizada com:
- 🔒 **Imutabilidade**: Registros não podem ser alterados
- 🔍 **Auditoria Completa**: Histórico transparente e verificável
- ⛏️ **Proof of Work**: Mineração com dificuldade ajustável
- 🔗 **Encadeamento**: Cada bloco aponta para o anterior
- ✅ **Validação**: Sistema de verificação de integridade

---

## 🛠️ Tecnologias Utilizadas

### 🎯 **Justificativa Técnica de Cada Tecnologia**

#### **Backend & Runtime**

##### **Node.js 16+**
```
✅ Por que escolhemos?
- Performance superior com V8 engine
- Ecossistema rico (npm) com 2M+ pacotes
- JavaScript full-stack (mesma linguagem frontend/backend)
- Event-driven ideal para aplicações I/O intensivas
- Comunidade ativa e suporte de longo prazo (LTS)
```

##### **Express.js 4.18.2**
```
✅ Por que escolhemos?
- Framework minimalista e flexível
- Middleware system robusto e extensível
- Performance comprovada em produção
- Documentação extensa e comunidade grande
- Facilita criação de APIs RESTful
- Compatível com diversos middlewares de segurança
```

#### **Banco de Dados**

##### **MongoDB 7.5 com Mongoose**
```
✅ Por que escolhemos?
- Schema flexível ideal para dados de licitações variados
- Excelente performance em leitura/escrita
- Escalabilidade horizontal (sharding)
- JSON nativo facilita integração com Node.js
- Mongoose oferece validação e modelagem robusta
- Queries poderosas com aggregation framework
- Ideal para armazenar dados estruturados e semi-estruturados
```

**Alternativas consideradas:**
- ❌ PostgreSQL: Schema rígido demais para nosso caso de uso
- ❌ MySQL: Menos performático para documentos complexos
- ✅ MongoDB: Flexibilidade + Performance + Escalabilidade

#### **Segurança & Autenticação**

##### **JWT (JSON Web Tokens) 9.0.2**
```
✅ Por que escolhemos?
- Stateless (não requer armazenamento no servidor)
- Autenticação escalável e distribuída
- Payload customizável com dados do usuário
- Padrão da indústria (RFC 7519)
- Facilita microservices e APIs
- Expires configurável por segurança
```

##### **bcrypt 5.1.1**
```
✅ Por que escolhemos?
- Algoritmo de hash robusto e comprovado
- Proteção contra rainbow table attacks
- Salt automático e único por senha
- Ajuste de rounds (10) para equilibrar segurança/performance
- Resistente a ataques de força bruta
- Padrão da indústria para hashing de senhas
```

##### **Helmet 7.0.0**
```
✅ Por que escolhemos?
- Configuração automática de headers de segurança
- Proteção contra vulnerabilidades comuns (XSS, clickjacking)
- Content Security Policy (CSP)
- Previne ataques MIME sniffing
- Configuração simples com defaults seguros
```

##### **CORS 2.8.5**
```
✅ Por que escolhemos?
- Controle granular de origens permitidas
- Essencial para APIs consumidas por frontends
- Configuração flexível de headers e métodos
- Proteção contra requisições não autorizadas
```

#### **Blockchain & Criptografia**

##### **Crypto (Node.js Native)**
```
✅ Por que escolhemos?
- SHA-256 para geração de hashes blockchain
- Nativo do Node.js (sem dependências externas)
- Performance otimizada
- Algoritmo comprovado e seguro
- Usado em Bitcoin e outras blockchains
```

**Implementação Blockchain Customizada:**
```
✅ Por que blockchain próprio?
- Controle total sobre regras de consenso
- Dificuldade de mineração ajustável
- Integração nativa com MongoDB
- Sem taxas de transação (blockchain privado)
- Proof of Work simplificado mas eficaz
- Adequado ao caso de uso específico
```

**Alternativas consideradas:**
- ❌ Ethereum: Custo de gas fees inviável
- ❌ Hyperledger: Complexidade desnecessária para MVP
- ✅ Blockchain Próprio: Controle total + Zero custos

#### **Upload & Arquivos**

##### **Multer 1.4.5-lts.1**
```
✅ Por que escolhemos?
- Middleware especializado para multipart/form-data
- Controle de tipo e tamanho de arquivo
- Armazenamento configurável (disco/memória)
- Integração perfeita com Express
- Validação robusta de uploads
- Renomeação automática de arquivos
```

#### **Documentação**

##### **Swagger UI Express 5.0.1 + YAML.js 0.3.0**
```
✅ Por que escolhemos?
- Interface interativa para testar API
- Documentação auto-gerada e sempre atualizada
- Padrão OpenAPI 3.0 (indústria)
- Facilita onboarding de desenvolvedores
- Exportação em JSON/YAML
- Try-it-out integrado
```

#### **Validação**

##### **Express-Validator 7.0.1**
```
✅ Por que escolhemos?
- Validação de entrada robusta e expressiva
- Sanitização automática de dados
- Mensagens de erro customizáveis
- Chain syntax intuitivo
- Integração nativa com Express
- Previne injeções e ataques
```

#### **Logging & Monitoramento**

##### **Morgan 1.10.1**
```
✅ Por que escolhemos?
- Logger HTTP para requisições/respostas
- Formatos pré-configurados (dev, combined)
- Essencial para debugging e auditoria
- Performance mínima overhead
- Integração simples com Express
```

#### **Testes**

##### **Jest 29.6.2**
```
✅ Por que escolhemos?
- Framework de testes completo e moderno
- Suporte nativo a async/await
- Cobertura de código integrada
- Mocking poderoso e intuitivo
- Snapshot testing para componentes
- Watch mode para desenvolvimento
- Comunidade ativa e documentação extensa
```

##### **Supertest 6.3.3**
```
✅ Por que escolhemos?
- Testes HTTP de alto nível
- Integração perfeita com Express
- Assertions expressivas
- Suporte a promises/async
- Ideal para testes de integração de APIs
```

##### **MongoDB Memory Server 9.0.1**
```
✅ Por que escolhemos?
- Banco de dados em memória para testes
- Zero configuração externa necessária
- Isolamento completo entre testes
- Performance superior (RAM vs disco)
- Limpeza automática após testes
- CI/CD friendly
```

#### **Desenvolvimento**

##### **Nodemon 3.0.1**
```
✅ Por que escolhemos?
- Auto-reload durante desenvolvimento
- Aumento de produtividade significativo
- Watch de arquivos configurável
- Delay configurável para evitar reloads múltiplos
```

##### **Dotenv 16.3.1**
```
✅ Por que escolhemos?
- Gerenciamento seguro de variáveis de ambiente
- Separação de configuração do código
- Diferentes ambientes (dev/test/prod)
- Padrão da indústria (12-factor app)
- Previne exposição de credenciais
```

---

## 📊 Arquitetura do Sistema

### 🏗️ **Estrutura de Camadas**

```
┌─────────────────────────────────────────┐
│         CAMADA DE APRESENTAÇÃO          │
│     (Swagger UI + Insomnia/Postman)     │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│          CAMADA DE ROTAS (API)          │
│  auth │ licitacao │ proposta │ docs     │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│         CAMADA DE MIDDLEWARES           │
│  Auth │ Validation │ Upload │ CORS      │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│        CAMADA DE CONTROLLERS            │
│  (Lógica de controle de requisições)   │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│         CAMADA DE SERVICES              │
│    (Regras de negócio + Blockchain)     │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│          CAMADA DE MODELS               │
│  Usuario │ Licitacao │ Proposta │ etc   │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│       CAMADA DE PERSISTÊNCIA            │
│         MongoDB + Blockchain            │
└─────────────────────────────────────────┘
```

### 🔄 **Fluxo de uma Transação**

```
1. Requisição HTTP chega na API
2. Middleware de autenticação valida JWT
3. Middleware de validação verifica dados
4. Controller processa a requisição
5. Service aplica regras de negócio
6. Blockchain registra a transação
7. Model salva no MongoDB
8. Resposta JSON retorna ao cliente
```

---

## 📦 Dependências do Projeto

### **Produção (dependencies)**
```json
{
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-validator": "^7.0.1",
  "helmet": "^7.0.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^7.5.0",
  "morgan": "^1.10.1",
  "multer": "^1.4.5-lts.1",
  "swagger-ui-express": "^5.0.1",
  "yamljs": "^0.3.0"
}
```

### **Desenvolvimento (devDependencies)**
```json
{
  "@types/jest": "^29.5.3",
  "jest": "^29.6.2",
  "mongodb-memory-server": "^9.0.1",
  "nodemon": "^3.0.1",
  "supertest": "^6.3.3"
}
```

---

## ⚙️ Instalação

### 🔹 **Pré-requisitos**

Certifique-se de ter instalado:

- ✅ **Node.js**: 16.0.0 ou superior ([Download](https://nodejs.org))
- ✅ **npm**: 8.0.0 ou superior (vem com Node.js)
- ✅ **MongoDB**: Local ou [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ **Git**: Para clonar o repositório ([Download](https://git-scm.com))

### 🔹 **Passo 1: Clonar o Repositório**

```bash
git clone https://github.com/seu-usuario/obras-blockchain.git
cd obras-blockchain
```

### 🔹 **Passo 2: Instalar Dependências**

```bash
npm install
```

### 🔹 **Passo 3: Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/obras_blockchain
# OU use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database

# Segurança
BCRYPT_ROUNDS=10
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao
JWT_EXPIRES_IN=24h

# Upload de Arquivos
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads/

# Logs
LOG_LEVEL=info
```

⚠️ **IMPORTANTE**: Nunca compartilhe seu arquivo `.env` ou faça commit dele no Git!

### 🔹 **Passo 4: Criar Diretório de Uploads**

```bash
npm run create-uploads
```

### 🔹 **Passo 5: Iniciar o Servidor**

#### **Modo Desenvolvimento** (com auto-reload):
```bash
npm run dev
```

#### **Modo Produção**:
```bash
npm start
```

### 🔹 **Passo 6: Verificar Instalação**

Acesse no navegador:

- 🌐 **API**: [http://localhost:3000/api](http://localhost:3000/api)
- 📖 **Documentação Swagger**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- 📄 **Swagger YAML**: [http://localhost:3000/api-docs.yaml](http://localhost:3000/api-docs.yaml)

✅ Se ver a mensagem de boas-vindas da API, está tudo funcionando!

---

## 🔑 Funcionalidades Principais

### 🏛️ **Para o Governo**

| ✅ Criar Licitações | Criar nova licitação com todos os dados 
| ✅ Publicar Editais | Tornar licitação pública para empresas 
| ✅ Gerenciar Licitações | Visualizar e editar licitações criadas 
| ✅ Receber Propostas | Ver todas propostas recebidas 
| ✅ Avaliar Propostas | Classificar, aprovar ou desclassificar 
| ✅ Dashboard | Estatísticas e métricas em tempo real 
| ✅ Upload Documentos | Anexar editais, contratos e documentos 

### 🏢 **Para Empresas**

| ✅ Ver Licitações | Consultar licitações abertas 
| ✅ Enviar Propostas | Submeter proposta para licitação 
| ✅ Acompanhar Status | Ver status das propostas enviadas 
| ✅ Dashboard | Métricas de participação e resultados 
| ✅ Histórico | Todas propostas enviadas 

### 👤 **Para Cidadãos**

| ✅ Consultar Licitações | Ver todas licitações públicas 
| ✅ Verificar Transparência | Estatísticas gerais do sistema
| ✅ Acompanhar Resultados | Ver resultados de licitações finalizadas 
| ✅ Verificar Blockchain | Validar integridade da blockchain 
| ✅ Ver Documentos Públicos | Acessar editais e documentos 
| ✅ Dashboard | Dados públicos de transparência 

### ⛓️ **Blockchain Features**

| Funcionalidade | Descrição |
|----------------|-----------|
| ✅ Registro Imutável | Todas transações importantes registradas 
| ✅ Proof of Work | Mineração com dificuldade ajustável 
| ✅ Encadeamento | Cada bloco aponta para o anterior 
| ✅ Validação | Verificação de integridade completa 
| ✅ Histórico | Rastreamento de todas operações 
| ✅ Hash SHA-256 | Algoritmo criptográfico robusto 

---

## 🧪 Testes

### 📊 **Cobertura de Testes**

```
✅ Testes Unitários: 15 testes
✅ Testes de Integração: 45+ testes
✅ Testes E2E: 1 fluxo completo
```

### 🔹 **Executar Todos os Testes**

```bash
npm test
```

### 🔹 **Testes Específicos**

```bash
# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Teste do fluxo completo (E2E)
npm run test:e2e

# Testes de autenticação
npm run test:auth

# Testes de licitações
npm run test:licitacao

# Testes de propostas
npm run test:proposta

# Testes de blockchain
npm run test:blockchain
```

---

## 📖 Documentação da API

### 🌐 **Swagger UI (Interativo)**

Acesse: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Recursos disponíveis:
- ✅ Testar todas as rotas diretamente
- ✅ Ver exemplos de requisição/resposta
- ✅ Documentação completa de schemas
- ✅ Autenticação JWT integrada

### 📄 **Exportar Documentação**

```bash
# Baixar YAML
curl http://localhost:3000/api-docs.yaml > api-docs.yaml

# Baixar JSON
curl http://localhost:3000/api-docs.json > api-docs.json
```

### 🔗 **Atalhos**

- 📖 Documentação: `http://localhost:3000/docs` (redireciona para `/api-docs`)
- 📄 YAML: `http://localhost:3000/api-docs.yaml`
- 📄 JSON: `http://localhost:3000/api-docs.json`

---

## 🗂️ Estrutura do Projeto

```
obras-blockchain/
│
├── 📁 coverage/                # Relatórios de cobertura de testes
│
├── 📁 tests/                   # Suíte completa de testes
│   ├── 📁 fixtures/            # Dados de teste (test-data.js)
│   ├── 📁 setup/               # Configuração dos testes
│   ├── 📁 unit/                # Testes unitários
│   │   ├── auth.test.js
│   │   ├── blockchain.test.js
│   │   ├── licitacao.test.js
│   │   └── proposta.test.js
│   └── 📁 integration/         # Testes de integração
│       ├── auth.integration.test.js
│       ├── licitacao.integration.test.js
│       ├── proposta.integration.test.js
│       ├── blockchain.integration.test.js
│       ├── dashboard.integration.test.js
│       ├── transparencia.integration.test.js
│       └── fluxo-completo.integration.test.js
│
├── 📁 uploads/                  # Diretório para arquivos uploadados
│
├── 📁 models/                   # Modelos do MongoDB (Mongoose)
│   ├── usuario.models.js
│   ├── licitacao.models.js
│   ├── proposta.models.js
│   ├── documento.models.js
│   └── transacao.models.js
│
├── 📁 controllers/              # Controladores (lógica de controle)
│   ├── auth.controller.js
│   ├── licitacao.controller.js
│   ├── proposta.controller.js
│   ├── documento.controller.js
│   ├── blockchain.controller.js
│   ├── dashboard.controller.js
│   └── transparencia.controller.js
│
├── 📁 services/                 # Serviços (regras de negócio)
│   ├── auth.service.js
│   ├── licitacao.service.js
│   ├── proposta.service.js
│   ├── documento.service.js
│   ├── blockchain.services.js
│   ├── dashboard.service.js
│   └── transparencia.service.js
│
├── 📁 routes/                   # Rotas da API (endpoints)
│   ├── auth.routes.js
│   ├── licitacao.routes.js
│   ├── proposta.routes.js
│   ├── documento.routes.js
│   ├── blockchain.routes.js
│   ├── dashboard.routes.js
│   └── transparencia.routes.js
│
├── 📁 middlewares/              # Middlewares (autenticação, validação)
│   ├── auth.middlewares.js
│   ├── validation.middleware.js
│   └── upload.middlewares.js
│
├── 📄 .env                      # Variáveis de ambiente (NÃO COMMITAR)
├── 📄 .gitignore               # Arquivos ignorados pelo Git
├── 📄 app.js                   # Configuração do Express
├── 📄 index.js                 # Arquivo principal (entry point)
├── 📄 swagger-setup.js         # Configuração do Swagger
├── 📄 swagger.yaml             # Documentação OpenAPI 3.0
├── 📄 insomnia.json            # Collection Insomnia/Postman
├── 📄 package.json             # Dependências e scripts
├── 📄 package-lock.json        # Lock de versões
└── 📄 README.md                # Esta documentação
```

---

## 📜 Scripts Disponíveis

```bash
# 🚀 Produção
npm start                    # Iniciar servidor em produção

# 💻 Desenvolvimento
npm run dev                  # Iniciar com nodemon (auto-reload)
npm run create-uploads       # Criar diretório de uploads

# 🧪 Testes
npm test                     # Executar todos os testes
npm run test:watch           # Testes em modo watch (desenvolvimento)
npm run test:coverage        # Testes com cobertura de código
npm run test:unit            # Apenas testes unitários
npm run test:integration     # Apenas testes de integração
npm run test:e2e             # Teste do fluxo completo (E2E)
npm run test:verbose         # Testes com saída detalhada
npm run test:debug           # Testes em modo debug
npm run test:auth            # Testes de autenticação
npm run test:licitacao       # Testes de licitações
npm run test:proposta        # Testes de propostas
npm run test:blockchain      # Testes de blockchain

# 🧹 Limpeza
npm run clean                # Limpar node_modules, coverage e reinstalar
```

---

## 🔐 Segurança Implementada

### 🛡️ **Camadas de Segurança**

#### **1. Autenticação JWT**
```javascript
✅ Tokens assinados e verificáveis
✅ Expiração configurável (24h padrão)
✅ Payload customizado com dados do usuário
✅ Stateless (escalável)
```

#### **2. Hash de Senhas (bcrypt)**
```javascript
✅ Salt único por senha
✅ 10 rounds de hashing
✅ Proteção contra rainbow tables
✅ Resistente a força bruta
```

#### **3. Validação de Entrada**
```javascript
✅ Express-validator em todas as rotas
✅ Sanitização automática
✅ Previne SQL/NoSQL injection
✅ Validação de tipos e formatos
```

#### **4. Headers de Segurança (Helmet)**
```javascript
✅ Content Security Policy (CSP)
✅ X-Frame-Options (clickjacking)
✅ X-Content-Type-Options (MIME sniffing)
✅ Strict-Transport-Security (HSTS)
```

#### **5. CORS Configurado**
```javascript
✅ Origens controladas
✅ Métodos HTTP específicos
✅ Headers permitidos definidos
```

#### **6. Upload Seguro**
```javascript
✅ Validação de tipo de arquivo
✅ Limite de tamanho (10MB)
✅ Renomeação automática
✅ Hash SHA-256 do arquivo
```

#### **7. Blockchain**
```javascript
✅ Imutabilidade de registros
✅ Proof of Work
✅ Verificação de integridade
✅ Auditoria completa
```

---

## 🏆 Diferenciais Competitivos

### 🎯 **Inovação Tecnológica**

| 🔗 **Blockchain Próprio** | Implementação customizada de blockchain | 🔒 Imutabilidade e auditoria |
| 🎭 **Multi-perfil** | Governo, Empresa e Cidadão | 🤝 Inclusão de todos stakeholders |
| 📱 **Interface Intuitiva** | API REST bem documentada | 🚀 Fácil integração |
| 🔍 **Transparência Total** | Dados públicos acessíveis | 👁️ Fiscalização cidadã |
| 📊 **Dashboards Personalizados** | Métricas por tipo de usuário | 📈 Insights em tempo real |
| 📖 **Documentação Completa** | Swagger + Insomnia + README | 📚 Facilita adoção | |

### 💡 **Benefícios Práticos**

#### **Para o Governo:**
- ⚡ Redução de tempo no processo licitatório
- 📉 Diminuição de custos operacionais
- 🔒 Proteção contra fraudes e irregularidades
- 📊 Métricas e relatórios automatizados
- 🌐 Acesso remoto e descentralizado

#### **Para Empresas:**
- 🎯 Acesso facilitado a licitações
- 📱 Envio digital de propostas
- 🔔 Acompanhamento em tempo real
- 📈 Histórico de participações
- 💰 Redução de custos com documentação física

#### **Para Cidadãos:**
- 👁️ Transparência total dos processos
- 🔍 Fiscalização facilitada
- 📊 Dados públicos acessíveis
- ⛓️ Verificação de integridade blockchain
- 🗳️ Fortalecimento da democracia

---

## 🔄 Fluxo de Funcionamento

### 📋 **Fluxo Principal do Sistema**

```
┌─────────────────────────────────────────────────────────┐
│                    PASSO 1: REGISTRO                    │
│  Governo, Empresas e Cidadãos se registram no sistema  │
│              ✅ Registrado na Blockchain                │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│              PASSO 2: GOVERNO CRIA LICITAÇÃO            │
│    Define: título, valor, prazo, requisitos técnicos    │
│  Status: RASCUNHO → ✅ Registrado na Blockchain         │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│            PASSO 3: GOVERNO PUBLICA LICITAÇÃO           │
│   Status: RASCUNHO → PUBLICADO                          │
│       ✅ Publicação registrada na Blockchain            │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│           PASSO 4: EMPRESAS VISUALIZAM EDITAIS          │
│  Empresas acessam licitações públicas disponíveis       │
│            (Sem registro na Blockchain)                 │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│            PASSO 5: EMPRESAS ENVIAM PROPOSTAS           │
│   Define: valor, prazo de execução, descrição técnica   │
│  Status: ENVIADA → ✅ Registrado na Blockchain          │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│           PASSO 6: GOVERNO AVALIA PROPOSTAS             │
│  Analisa propostas: CLASSIFICADA, VENCEDORA ou          │
│                    DESCLASSIFICADA                      │
│       ✅ Avaliação registrada na Blockchain             │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│         PASSO 7: LICITAÇÃO FINALIZADA                   │
│  Resultado publicado e acessível aos cidadãos           │
│         Status: FINALIZADO (Transparência)              │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│          PASSO 8: CIDADÃOS FISCALIZAM                   │
│  - Consultar detalhes da licitação                      │
│  - Ver propostas e resultados                           │
│  - Validar integridade da blockchain                    │
│  - Verificar transparência dos dados                    │
└─────────────────────────────────────────────────────────┘
```

## 🔗 Importação para Insomnia/Postman

### 📦 **Arquivo de Collection**

O projeto inclui um arquivo `insomnia.json` completo com **41 requisições** organizadas:

#### **Importar no Insomnia:**
1. Abra o Insomnia
2. `Application` → `Preferences` → `Data` → `Import Data`
3. Selecione `From File` → escolha `insomnia.json`
4. ✅ Collection importada!

#### **Importar no Postman:**
1. Abra o Postman
2. `Import` → `Upload Files`
3. Selecione `insomnia.json`
4. ✅ Collection importada!

### 📋 **Estrutura da Collection**

```
📦 Obras&Blockchain - API Completa (41 requisições)
│
├── 📁 01 - Autenticação (6 requisições)
├── 📁 02 - Governo (6 requisições)
├── 📁 03 - Empresa (4 requisições)
├── 📁 04 - Cidadão (4 requisições)
├── 📁 05 - Documentos (3 requisições)
├── 📁 06 - Blockchain (3 requisições)
└── 📁 07 - Fluxo Completo E2E (13 requisições)
```

### 🎯 **Fluxo de Teste Recomendado**

Execute as requisições na pasta **"07 - Fluxo Completo E2E"** em ordem sequencial (① a ⑬) para testar o sistema completo.

⚠️ **IMPORTANTE**: Copie os tokens e IDs retornados para as variáveis de ambiente após os passos ④, ⑤, ⑦, ⑧ e ⑩.

---

## 📊 Exemplos de Uso da API

### 1️⃣ **Registrar Usuário Governo**

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "usuario": "prefeitura_demo",
  "email": "licitacoes@prefeitura.gov.br",
  "senha": "123456789",
  "tipo_usuario": "governo"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "hash_blockchain": "a1b2c3d4e5f6..."
  }
}
```

### 2️⃣ **Login**

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "usuario": "prefeitura_demo",
  "senha": "123456789"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "usuario": "prefeitura_demo",
      "tipo_usuario": "governo"
    }
  }
}
```

### 3️⃣ **Criar Licitação**

```bash
POST http://localhost:3000/api/licitacoes/create
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json

{
  "titulo": "Construção de Escola Municipal",
  "descricao": "Licitação para construção de escola",
  "objeto_licitacao": "Obra de construção civil",
  "modalidade": "concorrencia",
  "valor_estimado": 2500000,
  "data_abertura": "2025-02-15T09:00:00.000Z",
  "data_fechamento": "2025-03-15T17:00:00.000Z"
}
```

### 📧 **Email**
obraseblockchain@gmail.com

### 🏫 **Instituição**
**ETEC Polivalente Americana**  
Americana - São Paulo, Brasil

### 🔗 **Links Úteis**
- 📺 **Vídeo **: [YouTube](https://youtu.be/MoeXD1XDfyY)
- 💾 **Download Vídeo**: [MediaFire](https://www.mediafire.com/file/rbz4loiat42e52j/Hackateen+Entrega.mp4/file)
- 💻 **Repositório**: [GitHub](https://github.com/lucasgomesdutra/Obras-Blockchain)
- 📖 **Documentação API**: [Swagger](http://localhost:3000/api-docs)

---

## 🙏 Agradecimentos

Agradecemos a todos que contribuíram para este projeto:

- 🏫 **ETEC Polivalente Americana** - Pelo suporte e infraestrutura
- 🏆 **Hackateen 2025** - Pela oportunidade e desafio
- 👨‍🏫 **Professores e Mentores** - Pela orientação e feedback

---

</div>

---

## 🎓 Aprendizados do Projeto

Durante o desenvolvimento do **Obras&Blockchain**, adquirimos experiência prática em:

### 💻 **Técnico**
- ✅ Desenvolvimento de APIs RESTful robustas
- ✅ Implementação de Blockchain do zero
- ✅ Autenticação e autorização JWT
- ✅ Testes automatizados (unitários, integração, E2E)
- ✅ Documentação de APIs com OpenAPI/Swagger
- ✅ Padrões de arquitetura (MVC, Services)
- ✅ Segurança de aplicações web
- ✅ Boas práticas de código limpo

### 🤝 **Trabalho em Equipe**
- ✅ Versionamento com Git/GitHub
- ✅ Code Review
- ✅ Divisão de tarefas
- ✅ Comunicação efetiva

### 📚 **Negócio**
- ✅ Processos de licitações públicas
- ✅ Transparência governamental
- ✅ Legislação brasileira
- ✅ Impacto social da tecnologia

---

<div align="center">


**ETEC Polivalente Americana • Hackateen 2025**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/seu-usuario/obras-blockchain)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/MoeXD1XDfyY)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:obraseblockchain@gmail.com)

---

### 📧 Dúvidas? Entre em contato!

---

**Última atualização**: Novembro 2025

</div>
