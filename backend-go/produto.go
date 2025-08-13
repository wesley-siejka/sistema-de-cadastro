package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Produto struct
// Representa os dados do produto conforme o formulário
// nome, categoria_id, marca, quantidade, preco, descricao
// O campo categoria_id faz referência à tabela categorias

type Produto struct {
	ID          int     `json:"id"`
	Nome        string  `json:"nome"`
	CategoriaID int     `json:"categoria_id"`
	Marca       string  `json:"marca"`
	Quantidade  int     `json:"quantidade"`
	Preco       float64 `json:"preco"`
	Descricao   string  `json:"descricao"`
}

// Handler para cadastrar produto
// Handler para /api/produtos
func handleProdutos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodGet:
		// Listar todos os produtos
		rows, err := db.Query(`SELECT id, nome, categoria_id, marca, quantidade, preco, descricao FROM produtos`)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao buscar produtos"}`)
			return
		}
		defer rows.Close()
		var produtos []Produto
		for rows.Next() {
			var p Produto
			err := rows.Scan(&p.ID, &p.Nome, &p.CategoriaID, &p.Marca, &p.Quantidade, &p.Preco, &p.Descricao)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				fmt.Fprintf(w, `{"error": "Erro ao ler produtos"}`)
				return
			}
			produtos = append(produtos, p)
		}
		json, _ := json.Marshal(produtos)
		w.Write(json)
	case http.MethodPost:
		// Cadastrar produto
		var prod Produto
		if err := json.NewDecoder(r.Body).Decode(&prod); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "JSON inválido"}`)
			return
		}
		if prod.Nome == "" {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "Nome obrigatório"}`)
			return
		}
		res, err := db.Exec(`INSERT INTO produtos (nome, categoria_id, marca, quantidade, preco, descricao) VALUES (?, ?, ?, ?, ?, ?)`, prod.Nome, prod.CategoriaID, prod.Marca, prod.Quantidade, prod.Preco, prod.Descricao)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao cadastrar produto"}`)
			return
		}
		id, _ := res.LastInsertId()
		prod.ID = int(id)
		json, _ := json.Marshal(prod)
		w.WriteHeader(http.StatusCreated)
		w.Write(json)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// Handler para /api/produtos/{id}
func handleProdutoByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := r.URL.Path[len("/api/produtos/"):]
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
	switch r.Method {
	case http.MethodGet:
		row := db.QueryRow(`SELECT id, nome, categoria_id, marca, quantidade, preco, descricao FROM produtos WHERE id = ?`, id)
		var p Produto
		err := row.Scan(&p.ID, &p.Nome, &p.CategoriaID, &p.Marca, &p.Quantidade, &p.Preco, &p.Descricao)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprintf(w, `{"error": "Produto não encontrado"}`)
			return
		}
		json, _ := json.Marshal(p)
		w.Write(json)
	case http.MethodPut:
		var prod Produto
		if err := json.NewDecoder(r.Body).Decode(&prod); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "JSON inválido"}`)
			return
		}
		if prod.Nome == "" {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(w, `{"error": "Nome obrigatório"}`)
			return
		}
		_, err := db.Exec(`UPDATE produtos SET nome=?, categoria_id=?, marca=?, quantidade=?, preco=?, descricao=? WHERE id=?`, prod.Nome, prod.CategoriaID, prod.Marca, prod.Quantidade, prod.Preco, prod.Descricao, id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao atualizar produto"}`)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"success": true}`)
		return
	case http.MethodDelete:
		_, err := db.Exec(`DELETE FROM produtos WHERE id = ?`, id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"error": "Erro ao excluir produto"}`)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
