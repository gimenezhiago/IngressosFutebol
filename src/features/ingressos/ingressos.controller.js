export class IngressosController {
  constructor(service) {
    this.service = service;
  }

  listarTodos = async (request, reply) => {
    return reply.send(await this.service.listarTodos(request.query));
  };

  buscarPorId = async (request, reply) => {
    return reply.send(
      await this.service.buscarPorId(Number(request.params.id))
    );
  };

  comprar = async (request, reply) => {
    const ingresso = await this.service.comprar(request.body);
    return reply.status(201).send(ingresso);
  };

  cancelar = async (request, reply) => {
    await this.service.cancelar(Number(request.params.id));
    return reply.status(204).send();
  };
}