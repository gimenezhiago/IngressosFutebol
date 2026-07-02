import { ConflictError, NotFoundError } from '../../errors/AppError.js';

export class UsuariosService {
  constructor(repository) {
    this.repository = repository;
  }

  async listarTodos() {
    return this.repository.findAll();
  }

  async buscarPorId(id) {
    const usuario = await this.repository.findById(id);
    if (!usuario) throw new NotFoundError('Usuário');
    return usuario;
  }

  async criar({ nome, email, cpf, telefone, data_nascimento }) {
    // RN-01: e-mail único
    const emailExistente = await this.repository.findByEmail(email);
    if (emailExistente) throw new ConflictError('E-mail já cadastrado.');

    // RN-02: CPF único
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cpfExistente = await this.repository.findByCpf(cpfLimpo);
    if (cpfExistente) throw new ConflictError('CPF já cadastrado.');

    const usuario = await this.repository.create({ nome, email, cpf: cpfLimpo });
    const perfil  = await this.repository.createPerfil(usuario.id, { telefone, data_nascimento });

    return { ...usuario, ...perfil };
  }

  async atualizar(id, dados) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Usuário');

    if (dados.email && dados.email !== existente.email) {
      const emailExistente = await this.repository.findByEmail(dados.email);
      if (emailExistente) throw new ConflictError('E-mail já cadastrado.');
    }

    if (dados.cpf) {
      dados.cpf = dados.cpf.replace(/\D/g, '');
      if (dados.cpf !== existente.cpf) {
        const cpfExistente = await this.repository.findByCpf(dados.cpf);
        if (cpfExistente) throw new ConflictError('CPF já cadastrado.');
      }
    }

    await this.repository.update(id, dados);

    if (dados.telefone !== undefined || dados.data_nascimento !== undefined) {
      await this.repository.createPerfil(id, {
        telefone:        dados.telefone,
        data_nascimento: dados.data_nascimento,
      });
    }

    return this.repository.findById(id);
  }

  async remover(id) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Usuário');
    await this.repository.delete(id);
  }
}