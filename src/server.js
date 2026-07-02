import 'dotenv/config';
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { registerRoutes } from './routes/index.js';
import { errorHandler }  from './errors/errorHandler.js';

const fastify = Fastify({
  logger: true,
});

// Swagger / OpenAPI
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'API de Ingressos — Futebol Brasileiro',
      description: 'Sistema de compra de ingressos para jogos de futebol do Brasil',
      version: '1.0.0',
    },
    tags: [
      { name: 'Usuários',  description: 'Gerenciamento de torcedores' },
      { name: 'Estádios',  description: 'Estádios disponíveis' },
      { name: 'Setores',   description: 'Setores dos estádios' },
      { name: 'Jogos',     description: 'Partidas disponíveis para compra' },
      { name: 'Ingressos', description: 'Compra e consulta de ingressos' },
    ],
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
});

// Rotas
await registerRoutes(fastify);

// Error handler global
fastify.setErrorHandler(errorHandler);

// Inicialização
const PORT = Number(process.env.PORT) || 3000;

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação disponível em http://localhost:${PORT}/docs`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}