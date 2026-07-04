# 🎫 Ingressos Futebol — API RESTful

API RESTful para sistema de compra de ingressos de jogos de futebol brasileiro, desenvolvida com **Node.js**, **Fastify** e **PostgreSQL**.

---

## 🚀 Tecnologias

- **Node.js** v22+ com ES Modules
- **Fastify** — framework web de alta performance
- **PostgreSQL** — banco de dados relacional
- **@fastify/swagger + @fastify/swagger-ui** — documentação OpenAPI
- **dotenv** — variáveis de ambiente
- **nodemon** — hot reload em desenvolvimento

---

## 📁 Estrutura do Projeto

```
src/
├── server.js                  # Bootstrap da aplicação
├── routes/
│   └── index.js               # Registro central de rotas
├── database/
│   ├── connection.js          # Pool de conexão PostgreSQL
│   ├── schema.sql             # Criação das tabelas
│   ├── seed.sql               # Dados iniciais para testes
│   └── migrate.js             # Runner de migrations
├── errors/
│   ├── AppError.js            # Hierarquia de erros da aplicação
│   └── errorHandler.js        # Handler global de erros do Fastify
└── features/
    ├── usuarios/              # Vertical slice de usuários
    │   ├── usuarios.repository.js
    │   ├── usuarios.service.js
    │   ├── usuarios.controller.js
    │   └── usuarios.routes.js
    ├── estadios/              # Vertical slice de estádios
    ├── setores/               # Vertical slice de setores
    ├── jogos/                 # Vertical slice de jogos
    └── ingressos/             # Vertical slice de ingressos
```

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/gimenezhiago/IngressosFutebol.git
cd IngressosFutebol
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com os dados do seu banco:

```env
PORT=3000
DB_HOST=seu_host
DB_PORT=5432
DB_NAME=futebol_ingressos
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

> **Atenção:** Se o banco for hospedado na nuvem (Neon, Supabase, Railway), o SSL já está configurado automaticamente via `ssl: { rejectUnauthorized: false }` no pool de conexão.

### 4. Execute as migrations e o seed

```bash
# Apenas o schema
node src/database/migrate.js

# Schema + dados iniciais
node src/database/migrate.js --seed
```

### 5. Inicie o servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`.
A documentação Swagger estará em `http://localhost:3000/docs`.

---

## 📚 Endpoints

### Usuários `/usuarios`

| Método | Rota           | Descrição                        |
|--------|----------------|----------------------------------|
| GET    | `/usuarios`    | Listar todos os usuários         |
| GET    | `/usuarios/:id`| Buscar usuário por ID            |
| POST   | `/usuarios`    | Criar novo usuário               |
| PUT    | `/usuarios/:id`| Atualizar usuário                |
| DELETE | `/usuarios/:id`| Remover usuário                  |

### Estádios `/estadios`

| Método | Rota            | Descrição                        |
|--------|-----------------|----------------------------------|
| GET    | `/estadios`     | Listar todos os estádios         |
| GET    | `/estadios/:id` | Buscar estádio por ID            |
| POST   | `/estadios`     | Criar novo estádio               |
| PUT    | `/estadios/:id` | Atualizar estádio                |
| DELETE | `/estadios/:id` | Remover estádio                  |

### Setores `/setores`

| Método | Rota           | Descrição                                  |
|--------|----------------|--------------------------------------------|
| GET    | `/setores`     | Listar setores (filtro: `?estadio_id=1`)   |
| GET    | `/setores/:id` | Buscar setor por ID                        |
| POST   | `/setores`     | Criar novo setor                           |
| PUT    | `/setores/:id` | Atualizar setor                            |
| DELETE | `/setores/:id` | Remover setor                              |

### Jogos `/jogos`

| Método | Rota                 | Descrição                                          |
|--------|----------------------|----------------------------------------------------|
| GET    | `/jogos`             | Listar jogos (filtros: `?campeonato=` `?estadio_id=`) |
| GET    | `/jogos/:id`         | Buscar jogo por ID                                 |
| GET    | `/jogos/:id/detalhes`| Jogo com estádio, setores e ingressos vendidos     |
| POST   | `/jogos`             | Criar novo jogo                                    |
| PUT    | `/jogos/:id`         | Atualizar jogo                                     |
| DELETE | `/jogos/:id`         | Remover jogo                                       |

### Ingressos `/ingressos`

| Método | Rota              | Descrição                                        |
|--------|-------------------|--------------------------------------------------|
| GET    | `/ingressos`      | Listar ingressos (filtros: `?usuario_id=` `?jogo_id=`) |
| GET    | `/ingressos/:id`  | Buscar ingresso com dados completos (JOIN)        |
| POST   | `/ingressos`      | Comprar ingresso                                 |
| DELETE | `/ingressos/:id`  | Cancelar ingresso                                |

---

## 📝 Exemplos de Requisição

### Criar usuário
```json
POST /usuarios
{
  "nome": "Carlos Silva",
  "email": "carlos@email.com",
  "cpf": "12345678901",
  "telefone": "11999990001",
  "data_nascimento": "1990-05-15"
}
```

### Comprar ingresso
```json
POST /ingressos
{
  "usuario_id": 1,
  "jogo_id": 1,
  "setor_id": 1
}
```

### Resposta — ingresso com JOIN completo
```json
GET /ingressos/1
{
  "id": 1,
  "valor": 60.00,
  "data_compra": "2025-08-01T14:30:00Z",
  "usuario": {
    "id": 1,
    "nome": "Carlos Silva",
    "email": "carlos@email.com",
    "cpf": "12345678901"
  },
  "jogo": {
    "id": 1,
    "time_mandante": "Corinthians",
    "time_visitante": "Palmeiras",
    "data_hora": "2025-08-10T16:00:00Z",
    "campeonato": "Brasileirão Série A"
  },
  "estadio": {
    "id": 1,
    "nome": "Arena Corinthians",
    "cidade": "São Paulo"
  },
  "setor": {
    "id": 1,
    "nome": "Norte",
    "preco_base": 60.00
  }
}
```

---

## ✅ Regras de Negócio

| Regra | Descrição | Onde é aplicada |
|-------|-----------|-----------------|
| RN-01 | Não permitir e-mail duplicado | `UsuariosService.criar()` |
| RN-02 | Não permitir CPF duplicado | `UsuariosService.criar()` |
| RN-03 | Bloquear compra sem vagas no setor | `IngressosService.comprar()` |
| RN-04 | Bloquear compra duplicada (mesmo usuário, jogo e setor) | `IngressosService.comprar()` |
| RN-05 | Bloquear exclusão de jogo com ingressos vendidos | `JogosService.remover()` |

---

## 🏗️ Arquitetura

O projeto segue **Vertical Slice Architecture**, onde cada funcionalidade é encapsulada em sua própria fatia com todas as camadas necessárias.

### Camadas por feature

```
Controller  →  recebe a requisição HTTP e delega ao Service
Service     →  aplica as regras de negócio
Repository  →  executa as queries no banco de dados
Routes      →  define os endpoints e schemas Swagger
```

### Injeção de Dependência

As dependências são injetadas manualmente via construtor, sem uso de container IoC:

```js
const repository = new UsuariosRepository(db);
const service    = new UsuariosService(repository);
const controller = new UsuariosController(service);
```

### Tratamento de Erros

Hierarquia de erros centralizada:

```
AppError (400)
├── NotFoundError (404)
├── ConflictError (409)
└── UnprocessableError (422)
```

O `errorHandler` global captura todos os erros e retorna respostas padronizadas, incluindo erros de constraint do PostgreSQL (códigos `23505` e `23503`).

### Transação Atômica na Compra

A compra de ingresso usa uma transação PostgreSQL para garantir consistência:

```
BEGIN
  → decrementa vagas do setor   (falha se = 0)
  → decrementa capacidade do jogo
  → insere o ingresso
COMMIT  (ou ROLLBACK em caso de erro)
```

---

## 📖 Documentação Swagger

Acesse `http://localhost:3000/docs` com o servidor rodando para visualizar e testar todos os endpoints interativamente.

---

## 🗄️ Modelo de Dados

```
usuarios (1) ──── (1) perfis_usuario
usuarios (N) ──── (N) jogos  [via ingressos]
estadios (1) ──── (N) jogos
estadios (1) ──── (N) setores
setores  (1) ──── (N) ingressos
jogos    (1) ──── (N) ingressos
```