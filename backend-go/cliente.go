package main

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
