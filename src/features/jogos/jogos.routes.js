import { JogosRepository } from './jogos.repository.js';
import { JogosService }    from './jogos.service.js';
import { JogosController } from './jogos.controller.js';
import { db } from '../../database/connection.js';

const jogoSchema = {
  type: 'object',
  properties: {
    id:                    { type: 'integer' },
    time_mandante:         { type: 'string' },
    time_visitante:        { type: 'string' },
    data_hora:             { type: 'string', format: 'date-time' },
    campeonato:            { type: 'string' },
    estadio_id:            { type: 'integer' },
    estadio_nome:          { type: 'string' },
    cidade:                { type: 'string' },
    capacidade_disponivel: { type: 'integer' },
  },
};

const jogoDetalhadoSchema = {
  type: 'object',
  properties: {
    ...jogoSchema.properties,
    estadio_capacidade: { type: 'integer' },
    ingressos_vendidos: { type: 'integer' },
    setores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id:               { type: 'integer' },
          nome:             { type: 'string' },
          preco_base:       { type: 'number' },
          quantidade_vagas: { type: 'integer' },
          vendidos:         { type: 'integer' },
        },
      },
    },
  },
};

export async function jogosRoutes(fastify) {
  const controller = new JogosController(
    new JogosService(new JogosRepository(db))
  );

  fastify.get('/', {
    schema: {
      tags: ['Jogos'],
      summary: 'Listar jogos (filtros: campeonato, estadio_id)',
      querystring: {
        type: 'object',
        properties: {
          campeonato: { type: 'string' },
          estadio_id: { type: 'integer' },
        },
      },
      response: { 200: { type: 'array', items: jogoSchema } },
    },
  }, controller.listarTodos);

  fastify.get('/:id', {
    schema: {
      tags: ['Jogos'],
      summary: 'Buscar jogo por ID',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 200: jogoSchema },
    },
  }, controller.buscarPorId);

  fastify.get('/:id/detalhes', {
    schema: {
      tags: ['Jogos'],
      summary: 'Jogo com estádio, setores e total de ingressos vendidos',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 200: jogoDetalhadoSchema },
    },
  }, controller.buscarComDetalhes);

  fastify.post('/', {
    schema: {
      tags: ['Jogos'],
      summary: 'Criar novo jogo',
      body: {
        type: 'object',
        required: ['time_mandante', 'time_visitante', 'data_hora', 'campeonato', 'estadio_id', 'capacidade_disponivel'],
        properties: {
          time_mandante:         { type: 'string' },
          time_visitante:        { type: 'string' },
          data_hora:             { type: 'string', format: 'date-time' },
          campeonato:            { type: 'string' },
          estadio_id:            { type: 'integer' },
          capacidade_disponivel: { type: 'integer', minimum: 0 },
        },
      },
      response: { 201: jogoSchema },
    },
  }, controller.criar);

  fastify.put('/:id', {
    schema: {
      tags: ['Jogos'],
      summary: 'Atualizar jogo',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          time_mandante:         { type: 'string' },
          time_visitante:        { type: 'string' },
          data_hora:             { type: 'string', format: 'date-time' },
          campeonato:            { type: 'string' },
          capacidade_disponivel: { type: 'integer', minimum: 0 },
        },
      },
    },
  }, controller.atualizar);

  fastify.delete('/:id', {
    schema: {
      tags: ['Jogos'],
      summary: 'Remover jogo (bloqueado se houver ingressos vendidos)',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 204: { type: 'null' } },
    },
  }, controller.remover);
}