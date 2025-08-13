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
func formatarCPF(cpf string) string {
	v := normalizarCPF(cpf)
	if len(v) != 11 {
		return cpf
	}
	return v[:3] + "." + v[3:6] + "." + v[6:9] + "-" + v[9:]
}
