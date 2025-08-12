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
