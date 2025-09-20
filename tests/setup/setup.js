// Timeout maior para testes de integração
jest.setTimeout(30000);

// Mock de console para testes mais limpos
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.PORT = 3001; // Porta diferente para testes