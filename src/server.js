import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';

import { registerRoutes } from './routes/index.js';
import { errorHandler } from './errors/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');

const fastify = Fastify({
  logger: true, 
});

// 2. REGISTRO DO CORS ADICIONADO AQUI (Antes do Swagger e das Rotas)
await fastify.register(cors, {
  origin: '*', // Permite acessos do seu front-end local
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
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

fastify.get('/', async (request, reply) => {
  const html = await fs.readFile(path.join(frontendDir, 'index.html'), 'utf8');
  return reply.type('text/html').send(html);
});

fastify.get('/style.css', async (request, reply) => {
  const css = await fs.readFile(path.join(frontendDir, 'style.css'), 'utf8');
  return reply.type('text/css').send(css);
});

fastify.get('/script.js', async (request, reply) => {
  const js = await fs.readFile(path.join(frontendDir, 'script.js'), 'utf8');
  return reply.type('application/javascript').send(js);
});

// Rotas
await registerRoutes(fastify);

// Error handler global
fastify.setErrorHandler(errorHandler);

// Inicialização
const PORT = Number(process.env.PORT) || 3001;

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação disponível em http://localhost:${PORT}/docs`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}