export class UsuariosRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const { rows } = await this.db.query(
      `SELECT u.*, p.telefone, p.data_nascimento
         FROM usuarios u
         LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
        ORDER BY u.id`
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await this.db.query(
      `SELECT u.*, p.telefone, p.data_nascimento
         FROM usuarios u
         LEFT JOIN perfis_usuario p ON p.usuario_id = u.id
        WHERE u.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const { rows } = await this.db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  async findByCpf(cpf) {
    const { rows } = await this.db.query(
      'SELECT id FROM usuarios WHERE cpf = $1',
      [cpf]
    );
    return rows[0] || null;
  }

  async create({ nome, email, cpf }) {
    const { rows } = await this.db.query(
      `INSERT INTO usuarios (nome, email, cpf)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, email, cpf]
    );
    return rows[0];
  }

  async createPerfil(usuarioId, { telefone, data_nascimento }) {
    const { rows } = await this.db.query(
      `INSERT INTO perfis_usuario (usuario_id, telefone, data_nascimento)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id) DO UPDATE
         SET telefone        = EXCLUDED.telefone,
             data_nascimento = EXCLUDED.data_nascimento
       RETURNING *`,
      [usuarioId, telefone || null, data_nascimento || null]
    );
    return rows[0];
  }

  async update(id, { nome, email, cpf }) {
    const { rows } = await this.db.query(
      `UPDATE usuarios
          SET nome  = COALESCE($1, nome),
              email = COALESCE($2, email),
              cpf   = COALESCE($3, cpf)
        WHERE id = $4
       RETURNING *`,
      [nome, email, cpf, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rowCount } = await this.db.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}