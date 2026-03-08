## Desafio - Orders API (Node.js + MongoDB)

**Jitterbit technical challenge** — Simple **Node.js** REST API in **JavaScript** for order management, built according to the challenge specifications.

### Repository description (English)

> **Orders API** — REST API built with Node.js, Express, and MongoDB (Mongoose) for the Jitterbit technical assessment. Provides CRUD operations for orders: create, get by order number, list all, update, and delete. Accepts requests in a challenge-defined format (`numeroPedido`, `valorTotal`, `dataCriacao`, `items`) and persists a normalized schema in MongoDB. Includes Swagger UI documentation at `/docs`.

### Tecnologias

- **Node.js / Express**
- **MongoDB** com **Mongoose**
- **dotenv** para variáveis de ambiente
,- **Swagger UI** para documentação interativa (`/docs`)

### Instalação

1. Certifique-se de ter **Node.js** instalado.
2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto, baseado em `.env.example`:

```bash
cp .env.example .env
```

4. Ajuste a variável `MONGODB_URI` se necessário (por padrão, usa `mongodb://localhost:27017/desafio_orders`).

### Executando o projeto

Modo desenvolvimento (com `nodemon`):

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Servidor ficará disponível em `http://localhost:3000`.

### Documentação com Swagger

- Acesse a documentação interativa em: `http://localhost:3000/docs`
- Lá você consegue:
  - Ver todos os endpoints (`/order`, `/order/{numeroPedido}`, `/order/list`, etc.)
  - Validar o formato do JSON esperado/retornado
  - Testar as requisições diretamente pela interface do Swagger UI

### Endpoints

- **Criar novo pedido (obrigatório)**  
  **POST** `http://localhost:3000/order`

  **Body (request) conforme desafio:**

  ```json
  {
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 1,
        "valorItem": 1000
      }
    ]
  }
  ```

  Os dados são automaticamente transformados e salvos no MongoDB como:

  ```json
  {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
  ```

- **Buscar pedido por número (obrigatório)**  
  **GET** `http://localhost:3000/order/{numeroPedido}`

- **Listar todos os pedidos (opcional)**  
  **GET** `http://localhost:3000/order/list`

- **Atualizar pedido por número (opcional)**  
  **PUT** `http://localhost:3000/order/{numeroPedido}`

  Body segue o mesmo formato do `POST` (numeroPedido é extraído da URL).

- **Deletar pedido por número (opcional)**  
  **DELETE** `http://localhost:3000/order/{numeroPedido}`

### Exemplo de requisição (curl)

```bash
curl --location 'http://localhost:3000/order' \
--header 'Content-Type: application/json' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'
```

