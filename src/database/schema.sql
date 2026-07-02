CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  cpf           CHAR(11)     NOT NULL UNIQUE,
  data_cadastro TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfis_usuario (
  id              SERIAL PRIMARY KEY,
  usuario_id      INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  telefone        VARCHAR(20),
  data_nascimento DATE
);

CREATE TABLE IF NOT EXISTS estadios (
  id               SERIAL PRIMARY KEY,
  nome             VARCHAR(150) NOT NULL,
  cidade           VARCHAR(100) NOT NULL,
  capacidade_total INT NOT NULL CHECK (capacidade_total > 0)
);

CREATE TABLE IF NOT EXISTS setores (
  id               SERIAL PRIMARY KEY,
  estadio_id       INT NOT NULL REFERENCES estadios(id) ON DELETE RESTRICT,
  nome             VARCHAR(100) NOT NULL,
  preco_base       NUMERIC(10,2) NOT NULL CHECK (preco_base >= 0),
  quantidade_vagas INT NOT NULL CHECK (quantidade_vagas >= 0)
);

CREATE TABLE IF NOT EXISTS jogos (
  id                    SERIAL PRIMARY KEY,
  time_mandante         VARCHAR(100) NOT NULL,
  time_visitante        VARCHAR(100) NOT NULL,
  data_hora             TIMESTAMPTZ  NOT NULL,
  campeonato            VARCHAR(100) NOT NULL,
  estadio_id            INT NOT NULL REFERENCES estadios(id) ON DELETE RESTRICT,
  capacidade_disponivel INT NOT NULL CHECK (capacidade_disponivel >= 0)
);

CREATE TABLE IF NOT EXISTS ingressos (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT NOT NULL REFERENCES usuarios(id)  ON DELETE RESTRICT,
  jogo_id     INT NOT NULL REFERENCES jogos(id)     ON DELETE RESTRICT,
  setor_id    INT NOT NULL REFERENCES setores(id)   ON DELETE RESTRICT,
  valor       NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  data_compra TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, jogo_id, setor_id)
);

CREATE INDEX IF NOT EXISTS idx_ingressos_usuario ON ingressos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_jogo    ON ingressos(jogo_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_setor   ON ingressos(setor_id);
CREATE INDEX IF NOT EXISTS idx_jogos_estadio     ON jogos(estadio_id);
CREATE INDEX IF NOT EXISTS idx_setores_estadio   ON setores(estadio_id);