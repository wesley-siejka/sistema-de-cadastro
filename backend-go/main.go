package main

import (
	"fmt"
	"log"
	"net/http"
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
	err := conectarDB()
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
	}
	defer db.Close()

	fmt.Println("Conexão com MySQL bem-sucedida!")

	mux := http.NewServeMux()
	mux.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"message": "pong"}`)
	})

	mux.HandleFunc("/api/clientes", handleClientes)
	mux.HandleFunc("/api/clientes/", handleClienteByID)

	fmt.Println("Servidor Go rodando em http://localhost:8080")
	http.ListenAndServe(":8080", enableCORS(mux))
}

// agora as rotas e handlers estão em arquivos separados
