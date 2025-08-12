# Sistema de Cadastro (Go + Next.js)

Este projeto é um sistema completo de cadastro de clientes, produtos e vendas, utilizando:

- **Backend:** Go (Golang) + MySQL
- **Frontend:** Next.js + React + Tailwind CSS

## Estrutura do Projeto

```
backend-go/           # API REST em Go
  ├── main.go         # Inicialização do servidor e rotas
  ├── db.go           # Conexão com o banco de dados
  ├── cliente.go      # Structs e modelos
  ├── handlers.go     # Handlers das rotas
  ├── utils.go        # Funções utilitárias (validação de CPF, etc)
  ├── go.mod          # Dependências do Go
  └── ...

frontend-nextjs/      # Aplicação web Next.js
  ├── package.json    # Dependências do frontend
  ├── src/app/        # Páginas e componentes
  ├── public/         # Imagens e arquivos estáticos
  └── ...

Como_rodar_MySQL_Windows.md # Guia para rodar o MySQL no Windows
```

## Como rodar o projeto

### Backend (Go)
1. Entre na pasta `backend-go`:
   ```sh
   cd backend-go
   ```
2. Instale as dependências:
   ```sh
   go mod tidy
   ```
3. Configure o acesso ao banco de dados em `db.go` (usuário, senha, banco).
4. Rode o servidor:
   ```sh
   go run main.go
   ```

### Frontend (Next.js)
1. Entre na pasta `frontend-nextjs`:
   ```sh
   cd frontend-nextjs
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Rode o frontend:
   ```sh
   npm run dev
   ```

Acesse o frontend em [http://localhost:3000](http://localhost:3000) e o backend em [http://localhost:8080](http://localhost:8080).

## Observações
- **Validação de CPF:** Utiliza bibliotecas prontas no backend (Go) e frontend (Next.js).
- **Banco de dados:** Certifique-se de que o MySQL está rodando e o banco/senha estão corretos.
- **Node.js na raiz:** Não é necessário ter `package.json` ou `node_modules` na raiz do projeto. Mantenha-os apenas em `frontend-nextjs/`.

## Licença
MIT
