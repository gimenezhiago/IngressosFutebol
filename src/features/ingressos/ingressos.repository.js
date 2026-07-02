export class IngressosRepository {
  constructor(db) {
    this.db = db;
  }

  #selectCompleto = `
    SELECT
      i.id,
      i.valor,
      i.data_compra,
      u.id             AS usuario_id,
      u.nome           AS usuario_nome,
      u.email          AS usuario_email,
      u.cpf            AS usuario_cpf,
      j.id             AS jogo_id,
      j.time_mandante,
      j.time_visitante,
      j.data_hora,
      j.campeonato,
      e.id             AS estadio_id,
      e.nome           AS estadio_nome,
      e.cidade         AS estadio_cidade,
      s.id             AS setor_id,
      s.nome           AS setor_nome,
      s.preco_base
    FROM ingressos i
    JOIN usuarios u ON u.id = i.usuario_id
    JOIN jogos    j ON j.id = i.jogo_id
    JOIN estadios e ON e.id = j.estadio_id
    JOIN setores  s ON s.id = i.setor_id
  `;

  #mapRow(row) {
    return {
      id:          row.id,
      valor:       Number(row.valor),
      data_compra: row.data_compra,
      usuario: {
        id:    row.usuario_id,
        nome:  row.usuario_nome,
        email: row.usuario_email,
        cpf:   row.usuario_cpf,
      },
      jogo: {
        id:             row.jogo_id,
        time_mandante:  row.time_mandante,
        time_visitante: row.time_visitante,
        data_hora:      row.data_hora,
        campeonato:     row.campeonato,
      },
      estadio: {
        id:     row.estadio_id,
        nome:   row.estadio_nome,
        cidade: row.estadio_cidade,
      },
      setor: {
        id:         row.setor_id,
        nome:       row.setor_nome,
        preco_base: Number(row.preco_base),
      },
    };
  }

  async findAll({ usuario_id, jogo_id } = {}) {
    const conditions = [];
    const values = [];

    if (usuario_id) {
      values.push(usuario_id);
      conditions.push(`i.usuario_id = $${values.length}`);
    }
    if (jogo_id) {
      values.push(jogo_id);
      conditions.push(`i.jogo_id = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await this.db.query(
      `${this.#selectCompleto} ${where} ORDER BY i.data_compra DESC`,
      values
    );
    return rows.map((r) => this.#mapRow(r));
  }

  async findById(id) {
    const { rows } = await this.db.query(
      `${this.#selectCompleto} WHERE i.id = $1`,
      [id]
    );
    return rows[0] ? this.#mapRow(rows[0]) : null;
  }

  async findDuplicado(usuario_id, jogo_id, setor_id) {
    const { rows } = await this.db.query(
      `SELECT id FROM ingressos
        WHERE usuario_id = $1 AND jogo_id = $2 AND setor_id = $3`,
      [usuario_id, jogo_id, setor_id]
    );
    return rows[0] || null;
  }

  async create({ usuario_id, jogo_id, setor_id, valor }, client) {
    const query = `
      INSERT INTO ingressos (usuario_id, jogo_id, setor_id, valor)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const { rows } = client
      ? await client.query(query, [usuario_id, jogo_id, setor_id, valor])
      : await this.db.query(query, [usuario_id, jogo_id, setor_id, valor]);
    return rows[0];
  }

  async delete(id) {
    const { rowCount } = await this.db.query(
      'DELETE FROM ingressos WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}