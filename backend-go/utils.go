package main

import "github.com/klassmann/cpfcnpj"

func normalizarCPF(cpf string) string {
	var res []rune
	for _, r := range cpf {
		if r >= '0' && r <= '9' {
			res = append(res, r)
		}
	}
	return string(res)
}

func validarCPF(cpf string) bool {
	c := cpfcnpj.NewCPF(cpf)
	return (&c).IsValid()
}
