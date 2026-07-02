export class SetoresController {
  constructor(service) {
    this.service = service;
  }

  listarTodos = async (request, reply) => {
    const { estadio_id } = request.query;
    return reply.send(
      await this.service.listarTodos(estadio_id ? Number(estadio_id) : undefined)
    );
  };

  buscarPorId = async (request, reply) => {
    return reply.send(await this.service.buscarPorId(Number(request.params.id)));
  };

  criar = async (request, reply) => {
    return reply.status(201).send(await this.service.criar(request.body));
  };

  atualizar = async (request, reply) => {
    return reply.send(
      await this.service.atualizar(Number(request.params.id), request.body)
    );
  };

  remover = async (request, reply) => {
    await this.service.remover(Number(request.params.id));
    return reply.status(204).send();
  };
}