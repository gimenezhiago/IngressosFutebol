export class JogosRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll({ campeonato, estadio_id } = {}) {
    const conditions = [];
    const values = [];

    if (campeonato) {
      values.push(`%${campeonato}%`);
      conditions.push(`j.campeonato ILIKE $${values.length}`);
    }
    if (estadio_id) {
      values.push(estadio_id);
      conditions.push(`j.estadio_id = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await this.db.query(
      `SELECT j.*, e.nome AS estadio_nome, e.cidade
         FROM jogos j
         JOIN estadios e ON e.id = j.estadio_id
        ${where}
        ORDER BY j.data_hora`,
      values
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await this.db.query(
      `SELECT j.*, e.nome AS estadio_nome, e.cidade, e.capacidade_total
         FROM jogos j
         JOIN estadios e ON e.id = j.estadio_id
        WHERE j.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByIdComDetalhes(id) {
    const jogoResult = await this.db.query(
      `SELECT j.*,
              e.nome             AS estadio_nome,
              e.cidade           AS estadio_cidade,
              e.capacidade_total AS estadio_capacidade,
              COUNT(i.id)        AS ingressos_vendidos
         FROM jogos j
         JOIN estadios e ON e.id = j.estadio_id
         LEFT JOIN ingressos i ON i.jogo_id = j.id
        WHERE j.id = $1
        GROUP BY j.id, e.id`,
      [id]
    );

    if (!jogoResult.rows[0]) return null;

    const setoresResult = await this.db.query(
      `SELECT s.*,
              COUNT(i.id) AS vendidos
         FROM setores s
         LEFT JOIN ingressos i ON i.setor_id = s.id AND i.jogo_id = $1
        WHERE s.estadio_id = (SELECT estadio_id FROM jogos WHERE id = $1)
        GROUP BY s.id
        ORDER BY s.nome`,
      [id]
    );

    return {
      ...jogoResult.rows[0],
      setores: setoresResult.rows,
    };
  }

  async create({ time_mandante, time_visitante, data_hora, campeonato, estadio_id, capacidade_disponivel }) {
    const { rows } = await this.db.query(
      `INSERT INTO jogos (time_mandante, time_visitante, data_hora, campeonato, estadio_id, capacidade_disponivel)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [time_mandante, time_visitante, data_hora, campeonato, estadio_id, capacidade_disponivel]
    );
    return rows[0];
  }

  async update(id, { time_mandante, time_visitante, data_hora, campeonato, capacidade_disponivel }) {
    const { rows } = await this.db.query(
      `UPDATE jogos
          SET time_mandante         = COALESCE($1, time_mandante),
              time_visitante        = COALESCE($2, time_visitante),
              data_hora             = COALESCE($3, data_hora),
              campeonato            = COALESCE($4, campeonato),
              capacidade_disponivel = COALESCE($5, capacidade_disponivel)
        WHERE id = $6
       RETURNING *`,
      [time_mandante, time_visitante, data_hora, campeonato, capacidade_disponivel, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rowCount } = await this.db.query(
      'DELETE FROM jogos WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  async hasIngressos(id) {
    const { rows } = await this.db.query(
      'SELECT 1 FROM ingressos WHERE jogo_id = $1 LIMIT 1',
      [id]
    );
    return rows.length > 0;
  }

  async decrementarCapacidade(id, client) {
    const query = `
      UPDATE jogos
         SET capacidade_disponivel = capacidade_disponivel - 1
       WHERE id = $1 AND capacidade_disponivel > 0
       RETURNING capacidade_disponivel
    `;
    const { rows } = client
      ? await client.query(query, [id])
      : await this.db.query(query, [id]);
    return rows[0] || null;
  }
}