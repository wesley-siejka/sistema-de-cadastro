package main

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func conectarDB() error {
	dsn := "user_sistema:123456@tcp(127.0.0.1:3306)/sistema_mirela"
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	return db.Ping()
}

// Cria as tabelas categorias e produtos se não existirem
func CriarTabelas() error {
	// Tabela de categorias
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS categorias (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nome VARCHAR(100) UNIQUE NOT NULL
	)`)
	if err != nil {
		return err
	}
	// Tabela de produtos
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS produtos (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nome VARCHAR(100) NOT NULL,
		categoria_id INT,
		marca VARCHAR(100),
		quantidade INT,
		preco DECIMAL(10,2),
		descricao TEXT,
		FOREIGN KEY (categoria_id) REFERENCES categorias(id)
	)`)
	if err != nil {
		return err
	}
	return nil
}
