package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

// Middleware para habilitar CORS
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Conexão com o MySQL
	dsn := "user_sistema:123456@tcp(127.0.0.1:3306)/sistema_mirela"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Erro ao abrir conexão com MySQL: %v", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatalf("Erro ao conectar ao MySQL: %v", err)
	}
	fmt.Println("Conexão com MySQL bem-sucedida!")

	// Criar tabela clientes se não existir
	createTable := `CREATE TABLE IF NOT EXISTS clientes (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nome VARCHAR(100) NOT NULL,
		email VARCHAR(100),
		telefone VARCHAR(20),
		cpf VARCHAR(20),
		endereco VARCHAR(200),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`
	_, err = db.Exec(createTable)
	if err != nil {
		log.Fatalf("Erro ao criar tabela clientes: %v", err)
	}
	fmt.Println("Tabela clientes pronta!")

	// Atualizar tabela clientes para novos campos
	alterTable := `ALTER TABLE clientes 
		ADD COLUMN IF NOT EXISTS cep VARCHAR(20),
		ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
		ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
		ADD COLUMN IF NOT EXISTS numero VARCHAR(20);`
	_, _ = db.Exec(alterTable)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"message": "pong"}`)
	})

	// Nova struct Cliente
	type Cliente struct {
		ID        int    `json:"id"`
		Nome      string `json:"nome"`
		CPF       string `json:"cpf"`
		CEP       string `json:"cep"`
		Cidade    string `json:"cidade"`
		Bairro    string `json:"bairro"`
		Numero    string `json:"numero"`
		Telefone  string `json:"telefone"`
		Email     string `json:"email"`
		CreatedAt string `json:"created_at"`
	}

	mux.HandleFunc("/api/clientes", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case http.MethodGet:
			rows, err := db.Query("SELECT id, nome, cpf, cep, cidade, bairro, numero, telefone, email, created_at FROM clientes")
			if err != nil {
				log.Printf("Erro ao buscar clientes: %v", err)
				w.WriteHeader(http.StatusInternalServerError)
				fmt.Fprintf(w, `{"error": "Erro ao buscar clientes: %v"}`, err)
				return
			}
			defer rows.Close()
			var clientes []Cliente
			for rows.Next() {
				var c Cliente
				if err := rows.Scan(&c.ID, &c.Nome, &c.CPF, &c.CEP, &c.Cidade, &c.Bairro, &c.Numero, &c.Telefone, &c.Email, &c.CreatedAt); err != nil {
					log.Printf("Erro ao ler clientes: %v", err)
					w.WriteHeader(http.StatusInternalServerError)
					fmt.Fprintf(w, `{"error": "Erro ao ler clientes: %v"}`, err)
					return
				}
				clientes = append(clientes, c)
			}
			json, _ := json.Marshal(clientes)
			w.Write(json)
		case http.MethodPost:
			var c Cliente
			if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				fmt.Fprintf(w, `{"error": "JSON inválido"}`)
				return
			}
			res, err := db.Exec("INSERT INTO clientes (nome, cpf, cep, cidade, bairro, numero, telefone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", c.Nome, c.CPF, c.CEP, c.Cidade, c.Bairro, c.Numero, c.Telefone, c.Email)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				fmt.Fprintf(w, `{"error": "Erro ao cadastrar cliente"}`)
				return
			}
			id, _ := res.LastInsertId()
			c.ID = int(id)
			json, _ := json.Marshal(c)
			w.WriteHeader(http.StatusCreated)
			w.Write(json)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	// Endpoint para GET e DELETE por id
	mux.HandleFunc("/api/clientes/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		idStr := r.URL.Path[len("/api/clientes/"):]
		if idStr == "" {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "ID não informado"}`)
			return
		}
		var id int
		_, err := fmt.Sscanf(idStr, "%d", &id)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "ID inválido"}`)
			return
		}
		if r.Method == http.MethodDelete {
			_, err := db.Exec("DELETE FROM clientes WHERE id = ?", id)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				fmt.Fprintf(w, `{"error": "Erro ao excluir cliente"}`)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method == http.MethodGet {
			row := db.QueryRow("SELECT id, nome, cpf, cep, cidade, bairro, numero, telefone, email, created_at FROM clientes WHERE id = ?", id)
			var c Cliente
			err := row.Scan(&c.ID, &c.Nome, &c.CPF, &c.CEP, &c.Cidade, &c.Bairro, &c.Numero, &c.Telefone, &c.Email, &c.CreatedAt)
			if err != nil {
				w.WriteHeader(http.StatusNotFound)
				fmt.Fprintf(w, `{"error": "Cliente não encontrado"}`)
				return
			}
			json, _ := json.Marshal(c)
			w.Write(json)
			return
		}
		w.WriteHeader(http.StatusMethodNotAllowed)
	})

	fmt.Println("Servidor Go rodando em http://localhost:8080")
	http.ListenAndServe(":8080", enableCORS(mux))
}
