const mongoose = require('mongoose'); 

beforeAll(async () => {
  // Limpar conexões pendentes
  await mongoose.disconnect();
  
  // Timeout
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Mock de console
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

// Variáveis para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.PORT = 3001; // Porta para testes