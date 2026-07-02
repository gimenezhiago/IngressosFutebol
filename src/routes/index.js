import { usuariosRoutes } from '../features/usuarios/usuarios.routes.js';
import { estadiosRoutes } from '../features/estadios/estadios.routes.js';
import { setoresRoutes }  from '../features/setores/setores.routes.js';
import { jogosRoutes }    from '../features/jogos/jogos.routes.js';
import { ingressosRoutes } from '../features/ingressos/ingressos.routes.js';

export async function registerRoutes(fastify) {
  fastify.register(usuariosRoutes,  { prefix: '/usuarios' });
  fastify.register(estadiosRoutes,  { prefix: '/estadios' });
  fastify.register(setoresRoutes,   { prefix: '/setores' });
  fastify.register(jogosRoutes,     { prefix: '/jogos' });
  fastify.register(ingressosRoutes, { prefix: '/ingressos' });
}