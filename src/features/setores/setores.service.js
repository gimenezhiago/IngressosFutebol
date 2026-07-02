import { NotFoundError } from '../../errors/AppError.js';

export class SetoresService {
  constructor(repository) {
    this.repository = repository;
  }

  async listarTodos(estadioId) {
    return this.repository.findAll(estadioId);
  }

  async buscarPorId(id) {
    const setor = await this.repository.findById(id);
    if (!setor) throw new NotFoundError('Setor');
    return setor;
  }

  async criar(dados) {
    return this.repository.create(dados);
  }

  async atualizar(id, dados) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Setor');
    return this.repository.update(id, dados);
  }

  async remover(id) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Setor');
    await this.repository.delete(id);
  }
}