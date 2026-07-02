INSERT INTO estadios (nome, cidade, capacidade_total) VALUES
  ('Arena Corinthians', 'São Paulo', 49205),
  ('Allianz Parque', 'São Paulo', 43713),
  ('Maracanã', 'Rio de Janeiro', 78838),
  ('Mineirão', 'Belo Horizonte', 61846),
  ('Arena Grêmio', 'Porto Alegre', 55000)
ON CONFLICT DO NOTHING;

INSERT INTO setores (estadio_id, nome, preco_base, quantidade_vagas) VALUES
  (1, 'Norte', 60.00, 5000),
  (1, 'Sul', 60.00, 5000),
  (1, 'Leste Premium', 150.00, 2000),
  (2, 'Arquibancada', 80.00, 8000),
  (2, 'Cadeira Especial', 200.00, 3000),
  (3, 'Setor Visitante', 50.00, 4000),
  (3, 'Maracanã Mais', 180.00, 1500),
  (4, 'Inferior', 70.00, 10000),
  (4, 'Superior', 45.00, 8000),
  (5, 'Arena 1', 90.00, 6000)
ON CONFLICT DO NOTHING;

INSERT INTO jogos (time_mandante, time_visitante, data_hora, campeonato, estadio_id, capacidade_disponivel) VALUES
  ('Corinthians', 'Palmeiras', '2025-08-10 16:00:00-03', 'Brasileirão Série A', 1, 10000),
  ('Palmeiras', 'São Paulo', '2025-08-17 18:30:00-03', 'Brasileirão Série A', 2, 11000),
  ('Flamengo', 'Vasco', '2025-08-24 20:00:00-03', 'Brasileirão Série A', 3, 5500),
  ('Atlético-MG', 'Cruzeiro', '2025-09-07 16:00:00-03', 'Copa do Brasil', 4, 18000),
  ('Grêmio', 'Internacional', '2025-09-14 20:30:00-03', 'Brasileirão Série A', 5, 6000)
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (nome, email, cpf) VALUES
  ('Carlos Silva', 'carlos@email.com', '12345678901'),
  ('Ana Souza', 'ana@email.com', '98765432100'),
  ('João Pereira', 'joao@email.com', '11122233344')
ON CONFLICT DO NOTHING;

INSERT INTO perfis_usuario (usuario_id, telefone, data_nascimento) VALUES
  (1, '11999990001', '1990-05-15'),
  (2, '21988880002', '1995-03-22'),
  (3, '51977770003', '1985-11-30')
ON CONFLICT DO NOTHING;