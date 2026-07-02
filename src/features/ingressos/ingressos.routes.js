import { IngressosRepository } from './ingressos.repository.js';
import { IngressosService }    from './ingressos.service.js';
import { IngressosController } from './ingressos.controller.js';
import { JogosRepository }     from '../jogos/jogos.repository.js';
import { SetoresRepository }   from '../setores/setores.repository.js';
import { db } from '../../database/connection.js';

const usuarioEmbutido = {
  type: 'object',
  properties: {
    id:    { type: 'integer' },
    nome:  { type: 'string' },
    email: { type: 'string' },
    cpf:   { type: 'string' },
  },
};

const jogoEmbutido = {
  type: 'object',
  properties: {
    id:             { type: 'integer' },
    time_mandante:  { type: 'string' },
    time_visitante: { type: 'string' },
    data_hora:      { type: 'string', format: 'date-time' },
    campeonato:     { type: 'string' },
  },
};

const estadioEmbutido = {
  type: 'object',
  properties: {
    id:     { type: 'integer' },
    nome:   { type: 'string' },
    cidade: { type: 'string' },
  },
};

const setorEmbutido = {
  type: 'object',
  properties: {
    id:         { type: 'integer' },
    nome:       { type: 'string' },
    preco_base: { type: 'number' },
  },
};

const ingressoSchema = {
  type: 'object',
  properties: {
    id:          { type: 'integer' },
    valor:       { type: 'number' },
    data_compra: { type: 'string', format: 'date-time' },
    usuario:     usuarioEmbutido,
    jogo:        jogoEmbutido,
    estadio:     estadioEmbutido,
    setor:       setorEmbutido,
  },
};

export async function ingressosRoutes(fastify) {
  const controller = new IngressosController(
    new IngressosService(
      new IngressosRepository(db),
      new JogosRepository(db),
      new SetoresRepository(db),
      db
    )
  );

  fastify.get('/', {
    schema: {
      tags: ['Ingressos'],
      summary: 'Listar ingressos (filtros: usuario_id, jogo_id)',
      querystring: {
        type: 'object',
        properties: {
          usuario_id: { type: 'integer' },
          jogo_id:    { type: 'integer' },
        },
      },
      response: { 200: { type: 'array', items: ingressoSchema } },
    },
  }, controller.listarTodos);

  fastify.get('/:id', {
    schema: {
      tags: ['Ingressos'],
      summary: 'Buscar ingresso por ID com dados completos (JOIN)',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 200: ingressoSchema },
    },
  }, controller.buscarPorId);

  fastify.post('/', {
    schema: {
      tags: ['Ingressos'],
      summary: 'Comprar ingresso (transação atômica com controle de vagas)',
      body: {
        type: 'object',
        required: ['usuario_id', 'jogo_id', 'setor_id'],
        properties: {
          usuario_id: { type: 'integer' },
          jogo_id:    { type: 'integer' },
          setor_id:   { type: 'integer' },
        },
      },
      response: { 201: ingressoSchema },
    },
  }, controller.comprar);

  fastify.delete('/:id', {
    schema: {
      tags: ['Ingressos'],
      summary: 'Cancelar ingresso',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 204: { type: 'null' } },
    },
  }, controller.cancelar);
}