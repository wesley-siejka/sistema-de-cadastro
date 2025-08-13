package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Categoria struct
type Categoria struct {
	ID   int    `json:"id"`
	Nome string `json:"nome"`
}

// Handler para cadastrar categoria
func handleCategorias(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodGet:
		// Listar todas as categorias
		rows, err := db.Query("SELECT id, nome FROM categorias")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao buscar categorias"}`)
			return
		}
		defer rows.Close()
		var categorias []Categoria
		for rows.Next() {
			var cat Categoria
			if err := rows.Scan(&cat.ID, &cat.Nome); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				fmt.Fprintf(w, `{"error": "Erro ao ler categorias"}`)
				return
			}
			categorias = append(categorias, cat)
		}
		if categorias == nil {
			categorias = []Categoria{}
		}
		json, _ := json.Marshal(categorias)
		w.Write(json)
	case http.MethodPost:
		var cat Categoria
		if err := json.NewDecoder(r.Body).Decode(&cat); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "JSON inválido"}`)
			return
		}
		if cat.Nome == "" {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "Nome obrigatório"}`)
			return
		}
		// Verifica se já existe
		var existe int
		err := db.QueryRow("SELECT COUNT(*) FROM categorias WHERE nome = ?", cat.Nome).Scan(&existe)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao verificar categoria"}`)
			return
		}
		if existe > 0 {
			w.WriteHeader(http.StatusConflict)
			fmt.Fprintf(w, `{"error": "Categoria já cadastrada"}`)
			return
		}
		res, err := db.Exec("INSERT INTO categorias (nome) VALUES (?)", cat.Nome)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao cadastrar categoria"}`)
			return
		}
		id, _ := res.LastInsertId()
		cat.ID = int(id)
		json, _ := json.Marshal(cat)
		w.WriteHeader(http.StatusCreated)
		w.Write(json)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func handleClientes(w http.ResponseWriter, r *http.Request) {
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
		cpfNormalizado := normalizarCPF(c.CPF)
		if !validarCPF(cpfNormalizado) {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "CPF inválido"}`)
			return
		}
		cpfFormatado := formatarCPF(cpfNormalizado)
		c.CPF = cpfFormatado
		var existe int
		err := db.QueryRow("SELECT COUNT(*) FROM clientes WHERE cpf = ?", c.CPF).Scan(&existe)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao verificar CPF"}`)
			return
		}
		if existe > 0 {
			w.WriteHeader(http.StatusConflict)
			fmt.Fprintf(w, `{"error": "CPF já cadastrado"}`)
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
}

func handleClienteByID(w http.ResponseWriter, r *http.Request) {
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
	if r.Method == http.MethodPut {
		var c Cliente
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "JSON inválido"}`)
			return
		}
		// Atualiza cliente no banco
		_, err := db.Exec("UPDATE clientes SET nome=?, cpf=?, cep=?, cidade=?, bairro=?, numero=?, telefone=?, email=? WHERE id=?", c.Nome, c.CPF, c.CEP, c.Cidade, c.Bairro, c.Numero, c.Telefone, c.Email, id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao atualizar cliente"}`)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"success": true}`)
		return
	}
	w.WriteHeader(http.StatusMethodNotAllowed)
}
